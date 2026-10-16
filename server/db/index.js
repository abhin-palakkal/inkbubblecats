const mongoose = require('mongoose');
const chalk = require('chalk');

mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
  })
  .then(() => {
    console.log(chalk.yellow('DB CONNECTED'));
  })
  .catch(error => {
    console.error('Database connection failed:', error.message);
  });

module.exports = mongoose;
