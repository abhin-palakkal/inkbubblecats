require('dotenv').config();

const connectDB = require('./db');
const Raffle = require('./db/models/Raffle');
const RaffleEntry = require('./db/models/RaffleEntry');

const createTestRaffle = async () => {
  try {
    await connectDB();

    // Remove any previous test raffle and its entries.
    const oldTests = await Raffle.find({ isTest: true }).select('_id');
    const oldIds = oldTests.map(raffle => raffle._id);

    if (oldIds.length > 0) {
      await RaffleEntry.deleteMany({ raffleId: { $in: oldIds } });
      await Raffle.deleteMany({ _id: { $in: oldIds } });
    }

    // Create an already-ended test raffle.
    const raffle = await Raffle.create({
      title: 'TEST ONLY - Automatic Draw',
      description: 'Temporary raffle for testing the scheduler.',
      prize: 'Test Prize - No Real Value',
      winnerCount: 2,
      startAt: new Date(Date.now() - 60 * 60 * 1000),
      endAt: new Date(Date.now() - 30 * 1000),
      status: 'ended',
      isTest: true,
      drawStarted: false,
    });

    // Fake entries for testing only; no real wallet verification.
    await RaffleEntry.create([
      {
        raffleId: raffle._id,
        walletAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        nftCount: 1,
        tickets: 1,
      },
      {
        raffleId: raffle._id,
        walletAddress: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        nftCount: 3,
        tickets: 2,
      },
      {
        raffleId: raffle._id,
        walletAddress: '0xcccccccccccccccccccccccccccccccccccccccc',
        nftCount: 5,
        tickets: 3,
      },
    ]);

    console.log('Test raffle created successfully.');
    console.log('Raffle ID:', raffle._id.toString());
    console.log('Wait for the running server scheduler to draw winners.');
  } catch (error) {
    console.error('Test raffle creation failed:', error.message);
    process.exitCode = 1;
  } finally {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
  }
};

createTestRaffle();
