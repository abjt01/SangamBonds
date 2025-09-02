const Bond = require('../models/Bond');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

// @desc    Get all bonds
// @route   GET /api/bonds
// @access  Public
const getAllBonds = async (req, res) => {
  try {
    const {
      sector,
      rating,
      search,
      sortBy = 'marketCap',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
      minYield,
      maxYield,
      riskLevel
    } = req.query;

    // Build filter query
    const filter = { isActive: true, tradingStatus: 'active' };

    if (sector && sector !== 'All') {
      filter.sector = sector;
    }

    if (rating && rating !== 'All') {
      filter['rating.value'] = rating;
    }

    if (riskLevel && riskLevel !== 'All') {
      filter.riskLevel = riskLevel;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { symbol: { $regex: search, $options: 'i' } },
        { issuer: { $regex: search, $options: 'i' } }
      ];
    }

    if (minYield || maxYield) {
      filter.currentYield = {};
      if (minYield) filter.currentYield.$gte = parseFloat(minYield);
      if (maxYield) filter.currentYield.$lte = parseFloat(maxYield);
    }

    // Build sort query
    const sortQuery = {};
    sortQuery[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [bonds, totalCount] = await Promise.all([
      Bond.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(parseInt(limit)),
      Bond.countDocuments(filter)
    ]);

    // Calculate market statistics
    const marketStats = await Bond.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalBonds: { $sum: 1 },
          avgYield: { $avg: '$currentYield' },
          totalVolume: { $sum: '$volume.today' },
          totalMarketCap: { $sum: '$marketCap' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        bonds,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalItems: totalCount,
          hasNext: skip + bonds.length < totalCount,
          hasPrev: parseInt(page) > 1
        },
        marketStats: marketStats[0] || {
          totalBonds: 0,
          avgYield: 0,
          totalVolume: 0,
          totalMarketCap: 0
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching bonds:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bonds'
    });
  }
};

// @desc    Get bond by ID
// @route   GET /api/bonds/:bondId
// @access  Public
const getBondById = async (req, res) => {
  try {
    const { bondId } = req.params;
    
    const bond = await Bond.findOne({ bondId, isActive: true });
    
    if (!bond) {
      return res.status(404).json({
        success: false,
        message: 'Bond not found'
      });
    }

    // Get similar bonds
    const similarBonds = await Bond.find({
      bondId: { $ne: bondId },
      sector: bond.sector,
      isActive: true,
      tradingStatus: 'active'
    })
    .limit(5)
    .select('bondId name currentPrice currentYield rating');

    res.json({
      success: true,
      data: {
        bond,
        similarBonds
      }
    });

  } catch (error) {
    logger.error('Error fetching bond:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bond'
    });
  }
};

// @desc    Get top performing bonds
// @route   GET /api/bonds/top-performers
// @access  Public
const getTopPerformers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topPerformers = await Bond.getTopPerformers(parseInt(limit));

    res.json({
      success: true,
      data: topPerformers
    });

  } catch (error) {
    logger.error('Error fetching top performers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top performers'
    });
  }
};

// @desc    Get high volume bonds
// @route   GET /api/bonds/high-volume
// @access  Public
const getHighVolume = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const highVolumeBonds = await Bond.getHighVolume(parseInt(limit));

    res.json({
      success: true,
      data: highVolumeBonds
    });

  } catch (error) {
    logger.error('Error fetching high volume bonds:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch high volume bonds'
    });
  }
};

// @desc    Get bonds by sector
// @route   GET /api/bonds/sector/:sector
// @access  Public
const getBondsBySector = async (req, res) => {
  try {
    const { sector } = req.params;
    const { limit = 20 } = req.query;

    const bonds = await Bond.getBySector(sector).limit(parseInt(limit));

    res.json({
      success: true,
      data: bonds
    });

  } catch (error) {
    logger.error('Error fetching bonds by sector:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bonds by sector'
    });
  }
};

// @desc    Get bonds by rating
// @route   GET /api/bonds/rating/:rating
// @access  Public
const getBondsByRating = async (req, res) => {
  try {
    const { rating } = req.params;
    const { limit = 20 } = req.query;

    const bonds = await Bond.getByRating(rating).limit(parseInt(limit));

    res.json({
      success: true,
      data: bonds
    });

  } catch (error) {
    logger.error('Error fetching bonds by rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bonds by rating'
    });
  }
};

// @desc    Update bond price (Admin only)
// @route   PUT /api/bonds/:bondId/price
// @access  Private (Admin)
const updateBondPrice = async (req, res) => {
  try {
    const { bondId } = req.params;
    const { newPrice } = req.body;

    if (!newPrice || newPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required'
      });
    }

    const bond = await Bond.findOne({ bondId });
    if (!bond) {
      return res.status(404).json({
        success: false,
        message: 'Bond not found'
      });
    }

    await bond.updatePrice(newPrice);

    // Emit price update via WebSocket
    if (global.io) {
      global.io.to(`bond_${bondId}`).emit('price_update', {
        bondId,
        newPrice,
        priceChange: bond.priceChange,
        timestamp: new Date()
      });
    }

    logger.info(`Bond price updated: ${bondId} - ${newPrice}`);

    res.json({
      success: true,
      message: 'Bond price updated successfully',
      data: {
        bondId,
        newPrice,
        priceChange: bond.priceChange
      }
    });

  } catch (error) {
    logger.error('Error updating bond price:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bond price'
    });
  }
};

// @desc    Get market overview
// @route   GET /api/bonds/market/overview
// @access  Public
const getMarketOverview = async (req, res) => {
  try {
    const overview = await Bond.aggregate([
      { $match: { isActive: true, tradingStatus: 'active' } },
      {
        $group: {
          _id: null,
          totalBonds: { $sum: 1 },
          avgYield: { $avg: '$currentYield' },
          totalMarketCap: { $sum: '$marketCap' },
          totalVolume: { $sum: '$volume.today' },
          avgPrice: { $avg: '$currentPrice' }
        }
      }
    ]);

    const sectorDistribution = await Bond.aggregate([
      { $match: { isActive: true, tradingStatus: 'active' } },
      {
        $group: {
          _id: '$sector',
          count: { $sum: 1 },
          avgYield: { $avg: '$currentYield' },
          totalMarketCap: { $sum: '$marketCap' }
        }
      },
      { $sort: { totalMarketCap: -1 } }
    ]);

    const ratingDistribution = await Bond.aggregate([
      { $match: { isActive: true, tradingStatus: 'active' } },
      {
        $group: {
          _id: '$rating.value',
          count: { $sum: 1 },
          avgYield: { $avg: '$currentYield' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: overview[0] || {},
        sectorDistribution,
        ratingDistribution
      }
    });

  } catch (error) {
    logger.error('Error fetching market overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch market overview'
    });
  }
};

module.exports = {
  getAllBonds,
  getBondById,
  getTopPerformers,
  getHighVolume,
  getBondsBySector,
  getBondsByRating,
  updateBondPrice,
  getMarketOverview
};
