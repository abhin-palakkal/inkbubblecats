const express = require('express');

const walletRoutes = require('./walletRoutes');
const myCatsRoutes = require('./myCatsRoutes');
const raffleRoutes = require('./raffleRoutes');
const adminRoutes = require('./adminRoutes');
const cloudinaryRoutes = require('./cloudinaryRoutes');

const router = express.Router();

console.log('[Routes] Registering API routes...');

router.use('/wallet', walletRoutes);
router.use('/my-cats', myCatsRoutes);
router.use('/raffles', raffleRoutes);
router.use('/admin', adminRoutes);
router.use('/cloudinary', cloudinaryRoutes);

console.log('[Routes] Cloudinary routes registered at /cloudinary');

router.get('/site-info', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      supply: 3333,
      chain: 'INK',
      name: 'Ink Bubble Cats',
      gtd: 'FREE MINT',
      fcfs: 'TBD',
      public: 'TBD',
      mintDate: 'TBD',
    },
  });
});

module.exports = router;
