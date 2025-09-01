const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found.'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked. Please try again later.'
      });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Middleware to check if user has specific role/permission
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }

    // For now, we'll use trading level as role
    const userRole = req.user.trading.level;
    
    if (!roles.includes(userRole) && !roles.includes('any')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Middleware to check KYC status
const requireKYC = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.user.kycStatus !== 'verified') {
    return res.status(403).json({
      success: false,
      message: 'KYC verification required to perform this action.',
      kycStatus: req.user.kycStatus
    });
  }

  next();
};

// Middleware to update last login
const updateLastLogin = async (req, res, next) => {
  if (req.user) {
    try {
      await User.findByIdAndUpdate(req.user._id, {
        lastLogin: new Date(),
        $unset: { loginAttempts: 1, lockUntil: 1 } // Reset login attempts on successful auth
      });
    } catch (error) {
      // Log error but don't fail the request
      console.error('Error updating last login:', error);
    }
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
  requireKYC,
  updateLastLogin
};