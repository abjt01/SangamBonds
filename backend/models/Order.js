const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    default: function() {
      return 'ORD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  bondId: {
    type: String,
    required: [true, 'Bond ID is required'],
    trim: true
  },
  bondName: {
    type: String,
    required: [true, 'Bond name is required']
  },
  
  // Order Details
  orderType: {
    type: String,
    enum: ['buy', 'sell'],
    required: [true, 'Order type is required']
  },
  orderSubType: {
    type: String,
    enum: ['market', 'limit', 'stop_loss'],
    default: 'market'
  },
  
  // Quantities and Prices
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  stopPrice: {
    type: Number,
    min: [0, 'Stop price cannot be negative']
  },
  totalValue: {
    type: Number,
    default: function() {
      return this.quantity * this.price;
    }
  },
  
  // Execution Details
  filledQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Filled quantity cannot be negative']
  },
  remainingQuantity: {
    type: Number,
    default: function() {
      return this.quantity;
    }
  },
  averageFilledPrice: {
    type: Number,
    default: 0
  },
  executedValue: {
    type: Number,
    default: 0
  },
  
  // Status and Timing
  status: {
    type: String,
    enum: ['pending', 'open', 'partial', 'filled', 'cancelled', 'expired', 'rejected'],
    default: 'pending'
  },
  
  // Timestamps
  placedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  },
  filledAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  
  // Order Configuration
  timeInForce: {
    type: String,
    enum: ['GTC', 'IOC', 'FOK', 'DAY'],
    default: 'GTC'
  },
  allowPartialFill: {
    type: Boolean,
    default: true
  },
  minimumFillQuantity: {
    type: Number,
    default: 1,
    min: [1, 'Minimum fill quantity must be at least 1']
  },
  
  // Trading Session
  tradingSession: {
    type: String,
    enum: ['pre_market', 'regular', 'post_market'],
    default: 'regular'
  },
  
  // Source and Device Info
  orderSource: {
    type: String,
    enum: ['web', 'mobile', 'api'],
    default: 'web'
  },
  deviceInfo: {
    userAgent: String,
    ipAddress: String,
    platform: String
  },
  
  // Execution History
  executions: [{
    executionId: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    executedAt: {
      type: Date,
      default: Date.now
    },
    counterpartyOrderId: String,
    fees: {
      brokerage: { type: Number, default: 0 },
      gst: { type: Number, default: 0 },
      stt: { type: Number, default: 0 },
      stampDuty: { type: Number, default: 0 }
    }
  }],
  
  // Fees and Charges
  totalFees: {
    brokerage: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    stt: { type: Number, default: 0 },
    stampDuty: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  
  // Cancellation Details - FIX: Remove default: null and make it optional
  cancellationReason: {
    type: String,
    enum: ['user_requested', 'insufficient_balance', 'insufficient_tokens', 'expired', 'system_error', 'market_closed']
    // Remove default: null - let it be undefined by default
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // Remove default: null
  },
  
  // Notes and Comments
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
orderSchema.virtual('completionPercentage').get(function() {
  return this.quantity > 0 ? (this.filledQuantity / this.quantity) * 100 : 0;
});

orderSchema.virtual('isActive').get(function() {
  return ['open', 'partial'].includes(this.status);
});

orderSchema.virtual('isCompleted').get(function() {
  return this.status === 'filled';
});

orderSchema.virtual('netAmount').get(function() {
  return this.executedValue - this.totalFees.total;
});

// Indexes for better performance
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ bondId: 1, orderType: 1, status: 1 });
orderSchema.index({ status: 1, expiresAt: 1 });
orderSchema.index({ placedAt: -1 });
orderSchema.index({ price: 1, placedAt: 1 });

// Pre-save middleware
orderSchema.pre('save', function(next) {
  // Update remaining quantity
  this.remainingQuantity = this.quantity - this.filledQuantity;
  
  // Update status based on filled quantity
  if (this.filledQuantity === 0 && this.status === 'pending') {
    this.status = 'open';
  } else if (this.filledQuantity > 0 && this.filledQuantity < this.quantity) {
    this.status = 'partial';
  } else if (this.filledQuantity >= this.quantity) {
    this.status = 'filled';
    this.filledAt = new Date();
  }
  
  // Calculate total fees
  this.totalFees.total = this.totalFees.brokerage + this.totalFees.gst + 
                        this.totalFees.stt + this.totalFees.stampDuty;
  
  // Update timestamp
  this.updatedAt = new Date();
  
  next();
});

// Instance methods
orderSchema.methods.executePartial = function(quantity, price, counterpartyOrderId) {
  const executionId = 'EXE_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5).toUpperCase();
  
  // Calculate fees for this execution
  const executionValue = quantity * price;
  const brokerage = executionValue * 0.001; // 0.1%
  const gst = brokerage * 0.18; // 18% GST on brokerage
  const stt = executionValue * 0.001; // 0.1% STT
  const stampDuty = executionValue * 0.00015; // 0.015% stamp duty
  
  // Add execution record
  this.executions.push({
    executionId,
    quantity,
    price,
    executedAt: new Date(),
    counterpartyOrderId,
    fees: { brokerage, gst, stt, stampDuty }
  });
  
  // Update order totals
  const previousExecutedValue = this.filledQuantity * this.averageFilledPrice;
  const newExecutedValue = quantity * price;
  
  this.filledQuantity += quantity;
  this.executedValue += newExecutedValue;
  
  // Calculate weighted average price
  if (this.filledQuantity > 0) {
    this.averageFilledPrice = (previousExecutedValue + newExecutedValue) / this.filledQuantity;
  }
  
  // Update total fees
  this.totalFees.brokerage += brokerage;
  this.totalFees.gst += gst;
  this.totalFees.stt += stt;
  this.totalFees.stampDuty += stampDuty;
  
  return this.save();
};

orderSchema.methods.cancel = function(reason = 'user_requested', cancelledBy = null) {
  if (['open', 'partial'].includes(this.status)) {
    this.status = 'cancelled';
    this.cancellationReason = reason;
    this.cancelledBy = cancelledBy;
    this.cancelledAt = new Date();
    return this.save();
  }
  throw new Error('Order cannot be cancelled in current status');
};

orderSchema.methods.expire = function() {
  if (['open', 'partial'].includes(this.status)) {
    this.status = 'expired';
    this.cancellationReason = 'expired';
    return this.save();
  }
  return this;
};

// Static methods
orderSchema.statics.getOrderBook = function(bondId, depth = 10) {
  const buyOrders = this.find({
    bondId,
    orderType: 'buy',
    status: { $in: ['open', 'partial'] },
    expiresAt: { $gt: new Date() }
  })
  .sort({ price: -1, placedAt: 1 })
  .limit(depth)
  .select('price remainingQuantity placedAt');

  const sellOrders = this.find({
    bondId,
    orderType: 'sell',
    status: { $in: ['open', 'partial'] },
    expiresAt: { $gt: new Date() }
  })
  .sort({ price: 1, placedAt: 1 })
  .limit(depth)
  .select('price remainingQuantity placedAt');

  return Promise.all([buyOrders, sellOrders]).then(([bids, asks]) => ({
    bondId,
    bids,
    asks,
    timestamp: new Date()
  }));
};

orderSchema.statics.getExpiredOrders = function() {
  return this.find({
    status: { $in: ['open', 'partial'] },
    expiresAt: { $lte: new Date() }
  });
};

orderSchema.statics.getUserOrderHistory = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ placedAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Order', orderSchema);
