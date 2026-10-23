require('dotenv').config();

const connectDB = require('./db');
const Raffle = require('./db/models/Raffle');

const checkTestRaffle = async () => {
  try {
    await connectDB();

    const raffle = await Raffle.findById('6adb035c3066e5fc5e6d49dd');

    if (!raffle) {
      console.log('Test raffle not found. Check the raffle ID.');
      return;
    }

    console.log('Title:', raffle.title);
    console.log('Status:', raffle.status);
    console.log('Draw started:', raffle.drawStarted);
    console.log('Draw started at:', raffle.drawStartedAt);
    console.log('Winners:', raffle.winners);
  } catch (error) {
    console.error('Verification failed:', error.message);
    process.exitCode = 1;
  } finally {
    await require('mongoose').disconnect();
  }
};

checkTestRaffle();
