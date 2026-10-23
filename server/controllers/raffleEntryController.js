const mongoose = require('mongoose');
const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');

const Raffle = require('../db/models/Raffle');
const RaffleEntry = require('../db/models/RaffleEntry');

const { calculateRaffleTickets } = require('../utils/raffleUtils');
const { getNftBalance } = require('../utils/nftUtils');

const enterRaffle = async (req, res) => {
  try {
    const { raffleId, walletAddress } = req.body;

    // 1. Validate required fields
    if (
      typeof raffleId !== 'string' ||
      typeof walletAddress !== 'string' ||
      !raffleId.trim() ||
      !walletAddress.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Raffle ID and wallet address are required',
      });
    }

    // 2. Validate raffle ID
    const normalizedRaffleId = raffleId.trim();

    if (!/^[a-fA-F0-9]{24}$/.test(normalizedRaffleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid raffle ID',
      });
    }
    // 3. Validate wallet address
    const normalizedWallet = walletAddress.trim();

    if (!ethers.isAddress(normalizedWallet)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address',
      });
    }

    const normalizedAddress = normalizedWallet.toLowerCase();

    // 4. Require the wallet verification token
    const authorization = req.headers.authorization;

    if (
      typeof authorization !== 'string' ||
      !authorization.startsWith('Bearer ')
    ) {
      return res.status(401).json({
        success: false,
        message: 'Wallet verification is required before entering',
      });
    }

    // 5. Ensure the verification secret is configured
    const verificationSecret = process.env.WALLET_VERIFICATION_SECRET;

    if (!verificationSecret) {
      console.error('WALLET_VERIFICATION_SECRET is not configured');

      return res.status(500).json({
        success: false,
        message: 'Wallet verification is not configured',
      });
    }

    // 6. Verify the JWT signature and expiration
    const token = authorization.slice('Bearer '.length).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Wallet verification token is missing',
      });
    }

    let decodedToken;

    try {
      decodedToken = jwt.verify(token, verificationSecret, {
        algorithms: ['HS256'],
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Wallet verification token is invalid or expired',
      });
    }

    // 7. Confirm the token was issued for raffle entry
    if (
      !decodedToken ||
      typeof decodedToken !== 'object' ||
      decodedToken.purpose !== 'raffle-entry' ||
      typeof decodedToken.walletAddress !== 'string'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid wallet verification token',
      });
    }

    // 8. Ensure the verified wallet matches the submitted wallet
    if (
      !ethers.isAddress(decodedToken.walletAddress) ||
      decodedToken.walletAddress.toLowerCase() !== normalizedAddress
    ) {
      return res.status(403).json({
        success: false,
        message: 'Verified wallet does not match the submitted wallet',
      });
    }

    // 9. Find raffle
    const raffle = await Raffle.findById(normalizedRaffleId);

    if (!raffle) {
      return res.status(404).json({
        success: false,
        message: 'Raffle not found',
      });
    }

    // 10. Check raffle opening and closing times
    const now = new Date();

    if (now < raffle.startAt || now >= raffle.endAt) {
      return res.status(400).json({
        success: false,
        message: 'This raffle is not currently open for entries',
      });
    }

    // 11. Verify NFT balance directly on INK Chain
    const nftCount = await getNftBalance(normalizedAddress);

    // 12. Calculate tickets using your existing ticket rules
    const tickets = calculateRaffleTickets(nftCount);

    if (tickets === 0) {
      return res.status(403).json({
        success: false,
        message: 'You must hold at least 1 Ink Bubble Cat to enter',
      });
    }

    // 13. Create one entry per wallet per raffle
    const entry = await RaffleEntry.create({
      raffleId: raffle._id,
      walletAddress: normalizedAddress,
      nftCount,
      tickets,
      requirementsCompleted: false,
    });

    return res.status(201).json({
      success: true,
      message: 'Raffle entry created successfully',
      data: entry,
    });
  } catch (error) {
    // Handle duplicate wallet entries
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This wallet has already entered this raffle',
      });
    }

    if (error.message === 'Invalid wallet address') {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address',
      });
    }

    console.error('Enter raffle error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to enter raffle',
    });
  }
};
const checkRaffleEntry = async (req, res) => {
  try {
    const { raffleId, walletAddress } = req.query;
    console.log('Entry status query:', req.query);
    console.log('Raffle ID:', raffleId, 'Length:', raffleId?.length);

    if (
      typeof raffleId !== 'string' ||
      typeof walletAddress !== 'string' ||
      !/^[a-fA-F0-9]{24}$/.test(raffleId) ||
      !ethers.isAddress(walletAddress)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid raffle ID and wallet address are required',
      });
    }

    const entry = await RaffleEntry.findOne({
      raffleId,
      walletAddress: walletAddress.toLowerCase(),
    });

    return res.status(200).json({
      success: true,
      hasEntered: Boolean(entry),
      data: entry || null,
      message: entry
        ? 'You have already entered this raffle'
        : 'No entry found for this wallet',
    });
  } catch (error) {
    console.error('Check raffle entry error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to check raffle entry',
    });
  }
};

module.exports = { enterRaffle, checkRaffleEntry };
