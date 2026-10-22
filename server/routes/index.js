const express = require('express');
const myCatsRoutes = require('./myCatsRoutes');
const router = express.Router();

const walletRoutes = require('./walletRoutes');

router.use('/wallet', walletRoutes);
router.use('/my-cats', myCatsRoutes);

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
