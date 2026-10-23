const mongoose = require('mongoose');

const raffleEntrySchema = new mongoose.Schema(
  {
    raffleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Raffle',
      required: true,
    },

    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    nftCount: {
      type: Number,
      required: true,
      min: 0,
    },

    tickets: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    requirementsCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// One entry per wallet for each raffle
raffleEntrySchema.index({ raffleId: 1, walletAddress: 1 }, { unique: true });

module.exports = mongoose.model('RaffleEntry', raffleEntrySchema);
