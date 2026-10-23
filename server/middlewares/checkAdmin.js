const jwt = require('jsonwebtoken');

const checkAdmin = (role = 'ADMIN') => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      // 1. Check authorization header
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Authentication token is required',
        });
      }

      // 2. Extract token
      const token = authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Authentication token is required',
        });
      }

      // 3. Verify token
      const decoded = jwt.verify(token, process.env.RAFFLE_ADMIN_SECRET);

      // 4. Check admin role
      if (decoded.role !== role) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized',
        });
      }

      // 5. Attach authenticated admin information
      req.admin = decoded;

      // 6. Allow request to continue
      next();
    } catch (error) {
      if (
        error.name === 'TokenExpiredError' ||
        error.name === 'JsonWebTokenError' ||
        error.name === 'NotBeforeError'
      ) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
        });
      }

      console.error('Admin authentication error:', error);

      return res.status(500).json({
        success: false,
        message: 'Authentication failed due to a server error',
      });
    }
  };
};

module.exports = checkAdmin;
