const express = require('express');
const router = express.Router();

const { checkWallet } = require('../controllers/wallet-controller');

router.post('/check', checkWallet);

module.exports = router;
