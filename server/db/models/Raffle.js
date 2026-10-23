const mongoose = require('mongoose');

const raffleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
    },

    prize: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },

    imagePublicId: {
      type: String,
      default: '',
    },

    winnerCount: {
      type: Number,
      default: 1,
      min: 1,
    },

    requirements: [
      {
        type: String,
        trim: true,
      },
    ],

    startAt: {
      type: Date,
      required: true,
    },

    endAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ['upcoming', 'active', 'ended', 'completed'],
      default: 'upcoming',
    },
    drawStarted: {
      type: Boolean,
      default: false,
    },
    drawStartedAt: {
      type: Date,
      default: null,
    },
    isTest: {
      type: Boolean,
      default: false,
    },
    winners: [
      {
        walletAddress: {
          type: String,
          lowercase: true,
          trim: true,
        },
        tickets: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Raffle', raffleSchema);
