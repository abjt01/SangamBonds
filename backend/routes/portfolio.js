const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const {
  getPortfolio,
  getPortfolioPerformance,
  getPortfolioAnalytics
} = require('../controllers/portfolioController');

// @route   GET /api/portfolio
// @desc    Get user portfolio
// @access  Private
router.get('/', authenticate, getPortfolio);

// @route   GET /api/portfolio/performance
// @desc    Get portfolio performance data
// @access  Private
router.get('/performance', [
  authenticate,
  query('period').optional().isIn(['1W', '1M', '3M', '6M', '1Y']).withMessage('Invalid period')
], getPortfolioPerformance);

// @route   GET /api/portfolio/analytics
// @desc    Get portfolio analytics
// @access  Private
router.get('/analytics', authenticate, getPortfolioAnalytics);

module.exports = router;
