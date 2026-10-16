const mongoose = require('mongoose');
const chalk = require('chalk');
const dns = require('node:dns');

dns.setServers(['1.1.1.1', '8.8.8.8']);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(chalk.yellow('DB CONNECTED'));
  })
  .catch(error => {
    console.error('Database connection failed:', error);
  });

module.exports = mongoose;
