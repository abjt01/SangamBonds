const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const {
  getAllBonds,
  getBondById,
  getTopPerformers,
  getHighVolume,
  getBondsBySector,
  getBondsByRating,
  updateBondPrice,
  getMarketOverview
} = require('../controllers/bondController');

// @route   GET /api/bonds
// @desc    Get all bonds with filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('minYield').optional().isFloat({ min: 0 }).withMessage('Min yield must be a positive number'),
  query('maxYield').optional().isFloat({ min: 0 }).withMessage('Max yield must be a positive number'),
  query('sortBy').optional().isIn(['price', 'yield', 'rating', 'volume', 'marketCap']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], getAllBonds);

// @route   GET /api/bonds/market/overview
// @desc    Get market overview statistics
// @access  Public
router.get('/market/overview', getMarketOverview);

// @route   GET /api/bonds/top-performers
// @desc    Get top performing bonds
// @access  Public
router.get('/top-performers', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], getTopPerformers);

// @route   GET /api/bonds/high-volume
// @desc    Get high volume bonds
// @access  Public
router.get('/high-volume', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], getHighVolume);

// @route   GET /api/bonds/sector/:sector
// @desc    Get bonds by sector
// @access  Public
router.get('/sector/:sector', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], getBondsBySector);

// @route   GET /api/bonds/rating/:rating
// @desc    Get bonds by rating
// @access  Public
router.get('/rating/:rating', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], getBondsByRating);

// @route   GET /api/bonds/:bondId
// @desc    Get bond by ID
// @access  Public
router.get('/:bondId', getBondById);

// @route   PUT /api/bonds/:bondId/price
// @desc    Update bond price (Admin only)
// @access  Private (Admin)
router.put('/:bondId/price', updateBondPrice);

module.exports = router;
