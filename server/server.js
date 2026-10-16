require('dotenv').config();

const express = require('express');
const chalk = require('chalk');
const db = require('./db');
const routes = require('./routes/index');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.use(routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(chalk.yellow(`app is running on port ${PORT}`));
});
