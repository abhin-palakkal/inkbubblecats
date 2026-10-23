const cron = require('node-cron');
const crypto = require('node:crypto');

const Raffle = require('../db/models/Raffle');
const RaffleEntry = require('../db/models/RaffleEntry');

const DRAW_TIMEOUT_MS = 5 * 60 * 1000;
const SCHEDULE = '* * * * *';

let isRunning = false;

/**
 * Select unique winners weighted by their ticket counts.
 * Each wallet can win only once per raffle.
 */
const selectWeightedWinners = (entries, winnerCount) => {
  const pool = entries
    .filter(
      entry =>
        Number.isSafeInteger(entry.tickets) &&
        entry.tickets > 0 &&
        typeof entry.walletAddress === 'string' &&
        entry.walletAddress.trim() !== ''
    )
    .map(entry => ({
      walletAddress: entry.walletAddress.trim().toLowerCase(),
      tickets: entry.tickets,
    }));

  // Combine duplicate entries for the same wallet.
  const uniqueWallets = new Map();

  for (const entry of pool) {
    const existing = uniqueWallets.get(entry.walletAddress);

    if (existing) {
      existing.tickets += entry.tickets;
    } else {
      uniqueWallets.set(entry.walletAddress, { ...entry });
    }
  }

  const winnerPool = [...uniqueWallets.values()];
  const winners = [];

  while (winnerPool.length > 0 && winners.length < winnerCount) {
    const totalTickets = winnerPool.reduce(
      (total, entry) => total + entry.tickets,
      0
    );

    if (!Number.isSafeInteger(totalTickets) || totalTickets <= 0) {
      throw new Error('Invalid total ticket count.');
    }

    // crypto.randomInt provides a secure random integer.
    let randomTicket = crypto.randomInt(totalTickets);
    let selectedIndex = 0;

    for (let i = 0; i < winnerPool.length; i++) {
      randomTicket -= winnerPool[i].tickets;

      if (randomTicket < 0) {
        selectedIndex = i;
        break;
      }
    }

    const selected = winnerPool.splice(selectedIndex, 1)[0];

    winners.push({
      walletAddress: selected.walletAddress,
      tickets: selected.tickets,
    });
  }

  return winners;
};

const drawEndedRaffles = async () => {
  // Prevent overlapping executions within this server process.
  if (isRunning) {
    console.log('[Raffle scheduler] Previous run is still running.');
    return;
  }

  isRunning = true;

  try {
    const now = new Date();
    const recoveryCutoff = new Date(now.getTime() - DRAW_TIMEOUT_MS);

    // Include both test and regular raffles.
    const expiredRaffles = await Raffle.find({
      endAt: { $lte: now },
      status: { $ne: 'completed' },
      $or: [
        { drawStarted: false },
        { drawStarted: { $exists: false } },
        {
          drawStarted: true,
          drawStartedAt: { $lte: recoveryCutoff },
        },
        {
          drawStarted: true,
          drawStartedAt: null,
        },
      ],
    }).select('_id title');

    console.log(
      `[Raffle scheduler] Found ${expiredRaffles.length} expired raffle(s).`
    );

    for (const item of expiredRaffles) {
      const claimTime = new Date();
      const claimRecoveryCutoff = new Date(
        claimTime.getTime() - DRAW_TIMEOUT_MS
      );

      // Atomically claim the raffle so another scheduler cannot draw it too.
      const raffle = await Raffle.findOneAndUpdate(
        {
          _id: item._id,
          endAt: { $lte: claimTime },
          status: { $ne: 'completed' },
          $or: [
            { drawStarted: false },
            { drawStarted: { $exists: false } },
            {
              drawStarted: true,
              drawStartedAt: { $lte: claimRecoveryCutoff },
            },
            {
              drawStarted: true,
              drawStartedAt: null,
            },
          ],
        },
        {
          $set: {
            drawStarted: true,
            drawStartedAt: claimTime,
            status: 'ended',
          },
        },
        { returnDocument: 'after' }
      );

      if (!raffle) {
        console.log(
          `[Raffle scheduler] Skipped "${item.title}" because it was claimed or completed by another process.`
        );
        continue;
      }

      try {
        console.log(
          `[Raffle scheduler] Drawing "${raffle.title}" (${raffle._id}).`
        );

        const entries = await RaffleEntry.find({
          raffleId: raffle._id,
          tickets: { $gt: 0 },
        });

        // An empty entry list correctly produces an empty winners array.
        const winners = selectWeightedWinners(entries, raffle.winnerCount);

        // Save results only if this process still owns the draw claim.
        const result = await Raffle.updateOne(
          {
            _id: raffle._id,
            status: 'ended',
            drawStarted: true,
            drawStartedAt: claimTime,
          },
          {
            $set: {
              winners,
              status: 'completed',
              drawStarted: false,
              drawStartedAt: null,
            },
          }
        );

        if (result.modifiedCount !== 1) {
          console.warn(
            `[Raffle scheduler] Could not finalize "${raffle.title}": draw claim was lost.`
          );
          continue;
        }

        console.log(
          `[Raffle scheduler] Completed "${raffle.title}". Entries: ${entries.length}. Winners: ${winners.length}.`
        );
      } catch (error) {
        console.error(
          `[Raffle scheduler] Draw failed for "${raffle.title}":`,
          error
        );

        // Release only this process's claim so the next run can retry.
        await Raffle.updateOne(
          {
            _id: raffle._id,
            status: 'ended',
            drawStarted: true,
            drawStartedAt: claimTime,
          },
          {
            $set: {
              drawStarted: false,
              drawStartedAt: null,
            },
          }
        );
      }
    }
  } catch (error) {
    console.error('[Raffle scheduler] Scheduler run failed:', error);
  } finally {
    isRunning = false;
  }
};

const startRaffleScheduler = () => {
  console.log('[Raffle scheduler] Started. Checking expired raffles.');

  // Check once immediately when the server starts.
  drawEndedRaffles().catch(error => {
    console.error('[Raffle scheduler] Initial check failed:', error);
  });

  // Then check every minute.
  cron.schedule(SCHEDULE, () => {
    drawEndedRaffles().catch(error => {
      console.error('[Raffle scheduler] Scheduled check failed:', error);
    });
  });
};

module.exports = startRaffleScheduler;
