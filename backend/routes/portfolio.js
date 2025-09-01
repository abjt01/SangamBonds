const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Get user portfolio
router.get('/', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        wallet: user.wallet,
        trading: user.trading,
        portfolioValue: user.portfolioValue
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio'
    });
  }
});

module.exports = router;
