const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

module.exports = router;
