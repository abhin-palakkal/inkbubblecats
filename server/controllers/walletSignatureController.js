const { ethers } = require('ethers');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { verifyWalletSignature } = require('../utils/walletSignatureUtils');

const WalletNonce = require('../db/models/WalletNonce');

const createWalletNonce = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    // 1. Validate wallet address
    if (
      typeof walletAddress !== 'string' ||
      !ethers.isAddress(walletAddress.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: 'A valid wallet address is required',
      });
    }

    const normalizedWallet = walletAddress.trim().toLowerCase();

    // 2. Generate a secure, unpredictable nonce
    const nonce = crypto.randomBytes(32).toString('hex');

    // 3. Set expiry to 5 minutes from now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 4. Replace any previous nonce for this wallet
    await WalletNonce.findOneAndUpdate(
      { walletAddress: normalizedWallet },
      { nonce, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 5. Build the exact message the wallet must sign
    const message = [
      'Ink Bubble Cats - Wallet Verification',
      '',
      `Wallet: ${normalizedWallet}`,
      `Nonce: ${nonce}`,
      'Purpose: Verify wallet ownership for raffle entry.',
      'This signature does not authorize a transaction.',
    ].join('\n');

    return res.status(200).json({
      success: true,
      message: 'Wallet verification message created',
      data: {
        walletAddress: normalizedWallet,
        message,
        expiresAt,
      },
    });
  } catch (error) {
    console.error('Create wallet nonce error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create wallet verification message',
    });
  }
};

const verifyWalletMessage = async (req, res) => {
  try {
    const { walletAddress, message, signature } = req.body;

    // 1. Validate request data
    if (
      typeof walletAddress !== 'string' ||
      !ethers.isAddress(walletAddress.trim()) ||
      typeof message !== 'string' ||
      typeof signature !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address, message, and signature are required',
      });
    }

    // 2. Ensure the verification secret is configured
    if (!process.env.WALLET_VERIFICATION_SECRET) {
      console.error('WALLET_VERIFICATION_SECRET is not configured');

      return res.status(500).json({
        success: false,
        message: 'Wallet verification is not configured',
      });
    }

    const normalizedWallet = walletAddress.trim().toLowerCase();

    // 3. Find the nonce currently stored for this wallet
    const walletNonce = await WalletNonce.findOne({
      walletAddress: normalizedWallet,
    });

    if (!walletNonce) {
      return res.status(400).json({
        success: false,
        message: 'Please request a new verification message',
      });
    }

    // 4. Check nonce expiry
    if (walletNonce.expiresAt <= new Date()) {
      await WalletNonce.deleteOne({ _id: walletNonce._id });

      return res.status(400).json({
        success: false,
        message: 'Verification message has expired',
      });
    }

    // 5. Rebuild the expected message on the server
    const expectedMessage = [
      'Ink Bubble Cats - Wallet Verification',
      '',
      `Wallet: ${normalizedWallet}`,
      `Nonce: ${walletNonce.nonce}`,
      'Purpose: Verify wallet ownership for raffle entry.',
      'This signature does not authorize a transaction.',
    ].join('\n');

    if (message !== expectedMessage) {
      return res.status(400).json({
        success: false,
        message: 'Verification message does not match',
      });
    }

    // 6. Verify that the signature belongs to this wallet
    const isValid = verifyWalletSignature(message, signature, normalizedWallet);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid wallet signature',
      });
    }

    // 7. Consume the nonce so it cannot be reused
    await WalletNonce.deleteOne({ _id: walletNonce._id });

    // 8. Issue a short-lived JWT proving wallet ownership
    const verificationToken = jwt.sign(
      {
        walletAddress: normalizedWallet,
        purpose: 'raffle-entry',
      },
      process.env.WALLET_VERIFICATION_SECRET,
      {
        expiresIn: '10m',
      }
    );

    // 9. Return the verification token
    return res.status(200).json({
      success: true,
      message: 'Wallet ownership verified successfully',
      data: {
        walletAddress: normalizedWallet,
        verified: true,
        verificationToken,
        expiresIn: 600,
      },
    });
  } catch (error) {
    console.error('Verify wallet message error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to verify wallet signature',
    });
  }
};

module.exports = {
  createWalletNonce,
  verifyWalletMessage,
};
