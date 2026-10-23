const express = require('express');
const router = express.Router();

const { signup, login } = require('../controllers/adminController');

// Admin signup
router.post('/signup', signup);

// Admin login
router.post('/login', login);

module.exports = router;
