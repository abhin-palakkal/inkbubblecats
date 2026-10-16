const express = require('express');
const router = express.Router();

const walletRoutes = require('./walletRoutes');

router.use('/wallet', walletRoutes);

module.exports = router;
