require('dotenv').config();

const express = require('express');
const chalk = require('chalk');
const cors = require('cors');

const connectDB = require('./db');
const routes = require('./routes/index');
const startRaffleScheduler = require('./utils/raffleScheduler');

const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  })
);

app.use(routes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    // Start automatic raffle winner selection after DB connects.
    startRaffleScheduler();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(chalk.yellow(`app is running on port ${PORT}`));
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
