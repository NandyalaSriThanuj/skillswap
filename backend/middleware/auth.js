// middleware/auth.js
// Protects routes by verifying JWT tokens

const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    // Header format: "Bearer <token>"
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token using our JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from database to make sure they still exist and are active
    const result = await query(
      'SELECT id, name, email, is_admin, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account has been deactivated.' 
      });
    }

    // Attach user to request object for use in route handlers
    req.user = user;
    next(); // Continue to the route handler

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired. Please login again.' 
      });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Admin-only middleware (use after authMiddleware)
const adminMiddleware = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
