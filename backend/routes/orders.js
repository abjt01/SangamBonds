const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authenticate } = require('../middleware/auth');

// Get user orders
router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ placedAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Place new order
router.post('/', authenticate, async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      userId: req.userId
    };
    
    const order = new Order(orderData);
    await order.save();
    
    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to place order'
    });
  }
});

module.exports = router;
