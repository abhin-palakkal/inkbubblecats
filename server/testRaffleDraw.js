const assert = require('node:assert/strict');

const selectWeightedWinners = (entries, winnerCount) => {
  const pool = entries
    .filter(entry => entry.tickets > 0)
    .map(entry => ({
      walletAddress: entry.walletAddress.toLowerCase(),
      tickets: entry.tickets,
    }));

  const winners = [];

  while (pool.length > 0 && winners.length < winnerCount) {
    const totalTickets = pool.reduce(
      (total, entry) => total + entry.tickets,
      0
    );

    let randomTicket = Math.random() * totalTickets;
    let selectedIndex = 0;

    for (let i = 0; i < pool.length; i++) {
      randomTicket -= pool[i].tickets;

      if (randomTicket < 0) {
        selectedIndex = i;
        break;
      }
    }

    winners.push(pool.splice(selectedIndex, 1)[0]);
  }

  return winners;
};

const testEntries = [
  { walletAddress: '0xaaaa', tickets: 1 },
  { walletAddress: '0xbbbb', tickets: 3 },
  { walletAddress: '0xcccc', tickets: 5 },
];

const trials = 100000;
const wins = new Map(testEntries.map(entry => [entry.walletAddress, 0]));

for (let i = 0; i < trials; i++) {
  const winner = selectWeightedWinners(testEntries, 1)[0];
  wins.set(winner.walletAddress, wins.get(winner.walletAddress) + 1);
}

console.log(`Results after ${trials} draws:`);

for (const entry of testEntries) {
  const actual = (wins.get(entry.walletAddress) / trials) * 100;
  const expected = (entry.tickets / 9) * 100;

  console.log(
    `${entry.walletAddress}: expected ${expected.toFixed(2)}%, actual ${actual.toFixed(2)}%`
  );
}

const winners = selectWeightedWinners(testEntries, 2);
const uniqueAddresses = new Set(winners.map(winner => winner.walletAddress));

assert.equal(winners.length, 2, 'Should select two winners');
assert.equal(uniqueAddresses.size, 2, 'Winners must be distinct');

console.log('Test passed: two distinct winners selected.');
console.log('Test result:', winners);
