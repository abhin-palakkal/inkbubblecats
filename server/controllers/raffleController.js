const Raffle = require('../db/models/Raffle');
const RaffleEntry = require('../db/models/RaffleEntry');

// Get all raffles with participant counts
const getAllRaffles = async (req, res) => {
  try {
    const raffles = await Raffle.find().sort({ createdAt: -1 });
    const now = new Date();

    const updatedRaffles = await Promise.all(
      raffles.map(async raffle => {
        let currentStatus = raffle.status;

        if (raffle.status !== 'completed') {
          if (now < raffle.startAt) {
            currentStatus = 'upcoming';
          } else if (now >= raffle.endAt) {
            currentStatus = 'ended';
          } else {
            currentStatus = 'active';
          }
        }

        // Count unique wallet addresses for this raffle
        const participantResult = await RaffleEntry.aggregate([
          {
            $match: {
              raffleId: raffle._id,
            },
          },
          {
            $group: {
              _id: {
                $toLower: '$walletAddress',
              },
            },
          },
          {
            $count: 'total',
          },
        ]);

        const participantCount =
          participantResult.length > 0 ? participantResult[0].total : 0;

        return {
          ...raffle.toObject(),
          status: currentStatus,
          participantCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: updatedRaffles.length,
      data: updatedRaffles,
    });
  } catch (error) {
    console.error('Get raffles error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch raffles',
    });
  }
};

// Get one raffle by ID
const getRaffleById = async (req, res) => {
  try {
    const raffle = await Raffle.findById(req.params.id);

    if (!raffle) {
      return res.status(404).json({
        success: false,
        message: 'Raffle not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: raffle,
    });
  } catch (error) {
    console.error('Get raffle error:', error);

    return res.status(400).json({
      success: false,
      message: 'Invalid raffle ID',
    });
  }
};

const getPastRaffles = async (req, res) => {
  try {
    const raffles = await Raffle.find({
      status: 'completed',
      isTest: false,
    })
      .sort({ endAt: -1 })
      .select('title prize winnerCount endAt winners');

    return res.status(200).json({
      success: true,
      count: raffles.length,
      data: raffles,
    });
  } catch (error) {
    console.error('Get past raffles error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch past raffles',
    });
  }
};

// Create a raffle
const createRaffle = async (req, res) => {
  try {
    const {
      title,
      description,
      prize,
      imageUrl,
      imagePublicId,
      winnerCount,
      requirements,
      startAt,
      endAt,
    } = req.body;

    if (!title || !prize || !startAt || !endAt) {
      return res.status(400).json({
        success: false,
        message: 'Title, prize, start time, and end time are required',
      });
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate <= startDate
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid raffle dates',
      });
    }

    const raffle = await Raffle.create({
      title,
      description,
      prize,
      imageUrl,
      imagePublicId,
      winnerCount,
      requirements,
      startAt: startDate,
      endAt: endDate,
      status: startDate > new Date() ? 'upcoming' : 'active',
    });

    return res.status(201).json({
      success: true,
      message: 'Raffle created successfully',
      data: raffle,
    });
  } catch (error) {
    console.error('Create raffle error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create raffle',
    });
  }
};
module.exports = {
  getAllRaffles,
  getRaffleById,
  getPastRaffles,
  createRaffle,
};
