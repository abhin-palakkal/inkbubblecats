const Wallet = require('../db/models/wallet');

const WALLET_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

const ELIGIBILITY_MESSAGES = {
  GTD: "You're on the GTD list! Your allocation is subject to the project's mint rules.",

  FCFS: "You're eligible for the FCFS phase. Availability depends on the project's mint rules and remaining spots.",

  PUBLIC:
    'No GTD or FCFS allocation was found for this wallet. Check the public mint announcement for details.',
};

exports.checkWallet = async (req, res, next) => {
  try {
    // 1. Validate request body
    const rawAddress = req.body?.address;

    if (typeof rawAddress !== 'string' || !rawAddress.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required.',
      });
    }

    // 2. Validate EVM address format
    const trimmedAddress = rawAddress.trim();

    if (!WALLET_ADDRESS_REGEX.test(trimmedAddress)) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid wallet address. Enter an address starting with 0x followed by 40 hexadecimal characters.',
      });
    }

    // 3. Normalize address for consistent database lookup
    const address = trimmedAddress.toLowerCase();

    // 4. Find the wallet in MongoDB
    const wallet = await Wallet.findOne({ address })
      .select('address eligibility')
      .lean()
      .exec();

    // 5. Unlisted wallets are classified as PUBLIC
    const eligibility = wallet?.eligibility ?? 'PUBLIC';

    // 6. Return a consistent response
    return res.status(200).json({
      success: true,
      data: {
        address,
        eligibility,
        message: ELIGIBILITY_MESSAGES[eligibility],
      },
    });
  } catch (error) {
    // Let Express error middleware handle unexpected errors
    return next(error);
  }
};
