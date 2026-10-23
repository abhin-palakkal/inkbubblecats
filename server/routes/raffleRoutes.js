const express = require('express');
const router = express.Router();

const checkAdmin = require('../middlewares/checkAdmin');

const {
  getAllRaffles,
  getRaffleById,
  getPastRaffles,
  createRaffle,
} = require('../controllers/raffleController');

const {
  enterRaffle,
  checkRaffleEntry,
} = require('../controllers/raffleEntryController');

const {
  createWalletNonce,
  verifyWalletMessage,
} = require('../controllers/walletSignatureController');

// Wallet signature verification
router.post('/nonce', createWalletNonce);
router.post('/verify-wallet', verifyWalletMessage);

// Public routes
router.get('/', getAllRaffles);
router.get('/past-winners', getPastRaffles);

// Check whether a wallet has already entered a raffle
// Keep this ABOVE '/:id'
router.get('/entry-status', checkRaffleEntry);

// Get a raffle by ID
router.get('/:id', getRaffleById);

// Enter a raffle
router.post('/enter', enterRaffle);

// Admin-only route
router.post('/', checkAdmin('ADMIN'), createRaffle);

module.exports = router;
