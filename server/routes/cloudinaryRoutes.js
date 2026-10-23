const express = require('express');
const checkAdmin = require('../middlewares/checkAdmin');
const {
  generateUploadSignature,
} = require('../controllers/cloudinaryController');

const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Cloudinary routes are working!' });
});
router.post('/signature', checkAdmin(), generateUploadSignature);

module.exports = router;
