const Order = require('../models/Order');
const Bond = require('../models/Bond');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');
const matchingEngine = require('../utils/matchingEngine');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose'); 

// @desc    Place new order
// @route   POST /api/orders
// @access  Private
const placeOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      bondId,
      orderType,
      orderSubType = 'market',
      quantity,
      price,
      timeInForce = 'GTC'
    } = req.body;

    // Validate bond exists
    const bond = await Bond.findOne({ bondId, isActive: true });
    if (!bond) {
      return res.status(404).json({
        success: false,
        message: 'Bond not found'
      });
    }

    // Get user
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate KYC for large orders
    if (user.kycStatus !== 'verified' && quantity * (price || bond.currentPrice) > 10000) {
      return res.status(403).json({
        success: false,
        message: 'KYC verification required for orders above ₹10,000'
      });
    }

    // Calculate order value
    const orderPrice = orderSubType === 'market' ? bond.currentPrice : price;
    const orderValue = quantity * orderPrice;

    // Validate buy order - check sufficient balance
    if (orderType === 'buy') {
      if (user.wallet.balance < orderValue) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance'
        });
      }

      if (bond.availableTokens < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient tokens available'
        });
      }
    }

    // Create order
    const order = new Order({
      userId: req.userId,
      bondId,
      bondName: bond.name,
      orderType,
      orderSubType,
      quantity,
      price: orderPrice,
      timeInForce,
      orderSource: 'web',
      deviceInfo: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    });

    await order.save();

    // Process order through matching engine
    const matchResult = await matchingEngine.processOrder(order, bond);

    // Update bond availability if tokens were traded
    if (matchResult.tokensTraded > 0) {
      bond.availableTokens -= matchResult.tokensTraded;
      bond.volume.today += matchResult.tokensTraded;
      bond.volume.total += matchResult.tokensTraded;
      await bond.save();
    }

    // Emit order update via WebSocket
    if (global.io) {
      global.io.to(`user_${req.userId}`).emit('order_update', {
        order: matchResult.order,
        status: 'placed'
      });

      global.io.to(`bond_${bondId}`).emit('market_update', {
        bondId,
        type: 'new_order',
        orderType,
        quantity,
        price: orderPrice
      });
    }

    logger.info(`Order placed: ${order.orderId} by user ${req.userId}`);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order: matchResult.order,
        transactions: matchResult.transactions || [],
        executionSummary: {
          totalExecuted: matchResult.totalExecuted || 0,
          avgExecutionPrice: matchResult.avgExecutionPrice || 0,
          remainingQuantity: matchResult.order.remainingQuantity
        }
      }
    });

  } catch (error) {
    logger.error('Error placing order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const {
      status,
      bondId,
      orderType,
      page = 1,
      limit = 50,
      sortBy = 'placedAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { userId: req.userId };
    
    if (status) {
      if (status === 'active') {
        filter.status = { $in: ['open', 'partial'] };
      } else {
        filter.status = status;
      }
    }

    if (bondId) filter.bondId = bondId;
    if (orderType) filter.orderType = orderType;

    const sortQuery = {};
    sortQuery[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalItems: totalCount,
          hasNext: skip + orders.length < totalCount,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:orderId
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ 
      $or: [
        { orderId },
        { _id: orderId }
      ],
      userId: req.userId 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    logger.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
};

// @desc    Cancel order
// @route   DELETE /api/orders/:orderId
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ 
      $or: [
        { orderId },
        { _id: orderId }
      ],
      userId: req.userId 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!['open', 'partial'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled in current status'
      });
    }

    await order.cancel('user_requested', req.userId);

    // Emit cancellation via WebSocket
    if (global.io) {
      global.io.to(`user_${req.userId}`).emit('order_update', {
        order,
        status: 'cancelled'
      });

      global.io.to(`bond_${order.bondId}`).emit('market_update', {
        bondId: order.bondId,
        type: 'order_cancelled',
        orderId: order.orderId
      });
    }

    logger.info(`Order cancelled: ${order.orderId} by user ${req.userId}`);

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });

  } catch (error) {
    logger.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
};

// @desc    Get order book for a bond
// @route   GET /api/orders/book/:bondId
// @access  Public
const getOrderBook = async (req, res) => {
  try {
    const { bondId } = req.params;
    const { depth = 10 } = req.query;

    const orderBook = await Order.getOrderBook(bondId, parseInt(depth));

    res.json({
      success: true,
      data: orderBook
    });

  } catch (error) {
    logger.error('Error fetching order book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order book'
    });
  }
};

// @desc    Get recent trades for a bond
// @route   GET /api/orders/trades/:bondId
// @access  Public
const getRecentTrades = async (req, res) => {
  try {
    const { bondId } = req.params;
    const { limit = 50 } = req.query;

    const trades = await Transaction.find({
      bondId,
      status: 'completed',
      transactionType: 'trade'
    })
    .sort({ executedAt: -1 })
    .limit(parseInt(limit))
    .select('price quantity totalValue executedAt transactionType');

    res.json({
      success: true,
      data: trades
    });

  } catch (error) {
    logger.error('Error fetching recent trades:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent trades'
    });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private
const getOrderStats = async (req, res) => {
  try {
    const userId = req.userId;

    const stats = await Order.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } }, // Fix this line
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          activeOrders: {
            $sum: {
              $cond: [{ $in: ['$status', ['open', 'partial']] }, 1, 0]
            }
          },
          completedOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'filled'] }, 1, 0]
            }
          },
          cancelledOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0]
            }
          },
          totalVolume: { $sum: '$totalValue' }
        }
      }
    ]);

    const result = stats[0] || {
      totalOrders: 0,
      activeOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      totalVolume: 0
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics'
    });
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getOrderBook,
  getRecentTrades,
  getOrderStats
};
