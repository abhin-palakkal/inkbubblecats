const crypto = require('crypto');
const cloudinary = require('../config/cloudinary');

const generateUploadSignature = (req, res) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);

    const paramsToSign = {
      timestamp,
      folder: 'ink-bubble-cats/raffles',
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: paramsToSign.folder,
    });
  } catch (error) {
    console.error('Cloudinary signature error:', error);

    res.status(500).json({
      message: 'Failed to generate upload signature',
    });
  }
};

module.exports = { generateUploadSignature };
