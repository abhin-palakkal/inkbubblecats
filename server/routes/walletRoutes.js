const express = require('express');
const router = express.Router();

const {
  checkWallet,
  getWallets,
  postData,
} = require('../controllers/wallet-controller');

router.post('/check', checkWallet);
router.get('/get', getWallets);
router.post('/post', postData);

module.exports = router;
