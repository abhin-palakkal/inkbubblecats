const Admin = require('../db/models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required',
      });
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // 3. Validate password length
    if (password.length < 12) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 12 characters long',
      });
    }

    // 4. Normalize input
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    // 5. Check whether admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'An admin with this email or username already exists',
      });
    }

    // 6. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 7. Create admin
    const newAdmin = await Admin.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'ADMIN',
    });

    // 8. Send response without password
    return res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    console.error('Admin signup error:', error);

    // Handle duplicate-key errors from MongoDB
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email or username already exists',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create admin',
    });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // 2. Find admin using normalized email
    const admin = await Admin.findOne({
      email: email.trim().toLowerCase(),
    });

    // 3. Check whether admin exists
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Email or password is incorrect',
      });
    }

    // 4. Compare password with hashed password
    const isMatching = await bcrypt.compare(password, admin.password);

    if (!isMatching) {
      return res.status(401).json({
        success: false,
        message: 'Email or password is incorrect',
      });
    }

    // 5. Generate JWT
    const token = jwt.sign(
      {
        id: admin._id.toString(),
        role: admin.role,
      },
      process.env.RAFFLE_ADMIN_SECRET,
      {
        expiresIn: '7d',
      }
    );

    // 6. Return successful login response
    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);

    return res.status(500).json({
      success: false,
      message: 'Login failed due to a server error',
    });
  }
};
