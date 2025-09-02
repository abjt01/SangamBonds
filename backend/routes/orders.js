const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const { authenticate, requireKYC } = require('../middleware/auth');
const {
  placeOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getOrderBook,
  getRecentTrades,
  getOrderStats
} = require('../controllers/orderController');

// @route   POST /api/orders
// @desc    Place a new order
// @access  Private
router.post('/', [
  authenticate,
  body('bondId').notEmpty().withMessage('Bond ID is required'),
  body('orderType').isIn(['buy', 'sell']).withMessage('Order type must be buy or sell'),
  body('orderSubType').optional().isIn(['market', 'limit', 'stop_loss']).withMessage('Invalid order sub-type'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('timeInForce').optional().isIn(['GTC', 'IOC', 'FOK', 'DAY']).withMessage('Invalid time in force')
], placeOrder);

// @route   GET /api/orders
// @desc    Get user orders with filtering
// @access  Private
router.get('/', [
  authenticate,
  query('status').optional().isIn(['pending', 'open', 'partial', 'filled', 'cancelled', 'expired', 'rejected', 'active']),
  query('orderType').optional().isIn(['buy', 'sell']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sortBy').optional().isIn(['placedAt', 'price', 'quantity']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], getUserOrders);

// @route   GET /api/orders/stats
// @desc    Get order statistics for user
// @access  Private
router.get('/stats', authenticate, getOrderStats);

// @route   GET /api/orders/book/:bondId
// @desc    Get order book for a bond
// @access  Public
router.get('/book/:bondId', [
  query('depth').optional().isInt({ min: 1, max: 50 }).withMessage('Depth must be between 1 and 50')
], getOrderBook);

// @route   GET /api/orders/trades/:bondId
// @desc    Get recent trades for a bond
// @access  Public
router.get('/trades/:bondId', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], getRecentTrades);

// @route   GET /api/orders/:orderId
// @desc    Get order by ID
// @access  Private
router.get('/:orderId', authenticate, getOrderById);

// @route   DELETE /api/orders/:orderId
// @desc    Cancel an order
// @access  Private
router.delete('/:orderId', authenticate, cancelOrder);

module.exports = router;
