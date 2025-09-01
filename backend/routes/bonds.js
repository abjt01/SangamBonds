const express = require('express');
const router = express.Router();
const Bond = require('../models/Bond');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

// Get all bonds
router.get('/', async (req, res) => {
  try {
    const bonds = await Bond.find({ isActive: true, tradingStatus: 'active' })
      .sort({ marketCap: -1 });
    
    res.json({
      success: true,
      data: bonds,
      count: bonds.length
    });
  } catch (error) {
    logger.error('Error fetching bonds:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bonds'
    });
  }
});

// Get bond by ID
router.get('/:bondId', async (req, res) => {
  try {
    const bond = await Bond.findOne({ bondId: req.params.bondId });
    
    if (!bond) {
      return res.status(404).json({
        success: false,
        message: 'Bond not found'
      });
    }
    
    res.json({
      success: true,
      data: bond
    });
  } catch (error) {
    logger.error('Error fetching bond:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bond'
    });
  }
});

module.exports = router;
