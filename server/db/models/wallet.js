const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    eligibility: {
      type: String,
      enum: ['GTD', 'FCFS'],
      required: true,
    },
  },
  { timestamps: true }
);

const Wallet = mongoose.model('wallets', walletSchema);

module.exports = Wallet;
