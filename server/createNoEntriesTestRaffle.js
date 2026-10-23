require('dotenv').config();
const mongoose = require('mongoose');
const Raffle = require('./db/models/Raffle');

async function createNoEntriesTestRaffle() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const now = Date.now();

    const raffle = await Raffle.create({
      title: 'TEST — No Entries (1 Minute)',
      description:
        'Temporary test raffle to verify the scheduler handles zero entries.',
      prize: 'Test Prize — No Real Value',
      winnerCount: 2,
      requirements: [],
      startAt: new Date(now - 60 * 1000),
      endAt: new Date(now + 60 * 1000),
      status: 'active',
      drawStarted: false,
      drawStartedAt: null,
      isTest: true,
      winners: [],
    });

    console.log('\nTest raffle created successfully!');
    console.log('Raffle ID:', raffle._id.toString());
    console.log('Title:', raffle.title);
    console.log('Status:', raffle.status);
    console.log('Entries: 0');
    console.log('Winner count:', raffle.winnerCount);
    console.log('Start time:', raffle.startAt);
    console.log('End time:', raffle.endAt);
    console.log('The raffle should end in approximately 1 minute.');
  } catch (error) {
    console.error('Failed to create test raffle:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createNoEntriesTestRaffle();
