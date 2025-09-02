const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    default: function() {
      return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  },
  
  // Order References
  buyOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Buy order ID is required']
  },
  sellOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Sell order ID is required']
  },
  
  // User References
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer ID is required']
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required']
  },
  
  // Bond Information
  bondId: {
    type: String,
    required: [true, 'Bond ID is required'],
    trim: true
  },
  bondName: {
    type: String,
    required: [true, 'Bond name is required'],
    trim: true
  },
  
  // Transaction Details
  quantity: {
    type: Number,
    required: [true, 'Transaction quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Transaction price is required'],
    min: [0, 'Price cannot be negative']
  },
  totalValue: {
    type: Number,
    required: [true, 'Total transaction value is required'],
    default: function() {
      return this.quantity * this.price;
    }
  },
  
  // Transaction Type
  transactionType: {
    type: String,
    enum: ['trade', 'transfer', 'dividend', 'maturity', 'coupon_payment', 'fee'],
    default: 'trade'
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'processing'],
    default: 'pending'
  },
  
  // Settlement Details
  settlementDate: {
    type: Date,
    default: function() {
      // T+2 settlement (2 business days after trade)
      const settleDate = new Date();
      settleDate.setDate(settleDate.getDate() + 2);
      return settleDate;
    }
  },
  settlementStatus: {
    type: String,
    enum: ['pending', 'settled', 'failed', 'partial'],
    default: 'pending'
  },
  
  // Fees and Charges
  fees: {
    brokerage: {
      type: Number,
      default: 0,
      min: 0
    },
    gst: {
      type: Number,
      default: 0,
      min: 0
    },
    stt: { // Securities Transaction Tax
      type: Number,
      default: 0,
      min: 0
    },
    stampDuty: {
      type: Number,
      default: 0,
      min: 0
    },
    exchangeFee: {
      type: Number,
      default: 0,
      min: 0
    },
    clearingFee: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Net Amounts (after fees)
  buyerNetAmount: {
    type: Number,
    default: function() {
      return this.totalValue + this.fees.total; // Buyer pays fees
    }
  },
  sellerNetAmount: {
    type: Number,
    default: function() {
      return this.totalValue - this.fees.total; // Seller receives after fees
    }
  },
  
  // Execution Details
  executedAt: {
    type: Date,
    default: Date.now
  },
  executionVenue: {
    type: String,
    default: 'SangamBonds Exchange'
  },
  
  // Market Data at Time of Trade
  marketData: {
    bidPrice: Number,
    askPrice: Number,
    lastPrice: Number,
    volume: Number,
    marketCap: Number
  },
  
  // Trading Session
  tradingSession: {
    type: String,
    enum: ['pre_market', 'regular', 'post_market'],
    default: 'regular'
  },
  
  // Reference Numbers
  exchangeRefNo: {
    type: String,
    default: function() {
      return 'EXG_' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
  },
  clearingRefNo: {
    type: String,
    default: function() {
      return 'CLR_' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
  },
  
  // Additional Information
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  
  // Audit Trail
  auditTrail: {
    createdBy: {
      type: String,
      default: 'system'
    },
    modifiedBy: {
      type: String,
      default: 'system'
    },
    ipAddress: String,
    userAgent: String,
    platform: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web'
    }
  },
  
  // Performance Metrics
  metrics: {
    processingTime: {
      type: Number, // in milliseconds
      default: 0
    },
    matchingLatency: {
      type: Number, // in milliseconds
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
transactionSchema.virtual('daysSinceTransaction').get(function() {
  return Math.floor((new Date() - this.executedAt) / (1000 * 60 * 60 * 24));
});

transactionSchema.virtual('isSettled').get(function() {
  return this.settlementStatus === 'settled';
});

transactionSchema.virtual('profitLoss').get(function() {
  // This would need to be calculated based on the original purchase price
  // Simplified calculation here
  return 0;
});

// Indexes for better performance
transactionSchema.index({ buyerId: 1, executedAt: -1 });
transactionSchema.index({ sellerId: 1, executedAt: -1 });
transactionSchema.index({ bondId: 1, executedAt: -1 });
transactionSchema.index({ executedAt: -1 });
transactionSchema.index({ status: 1, settlementStatus: 1 });
transactionSchema.index({ transactionId: 1 }, { unique: true });
transactionSchema.index({ 'auditTrail.createdBy': 1 });

// Pre-save middleware
transactionSchema.pre('save', function(next) {
  // Calculate total fees
  this.fees.total = this.fees.brokerage + this.fees.gst + this.fees.stt + 
                   this.fees.stampDuty + this.fees.exchangeFee + this.fees.clearingFee;
  
  // Calculate net amounts
  this.buyerNetAmount = this.totalValue + this.fees.total;
  this.sellerNetAmount = this.totalValue - this.fees.total;
  
  next();
});

// Instance methods
transactionSchema.methods.calculateFees = function() {
  const baseValue = this.totalValue;
  
  // Fee structure (can be made configurable)
  this.fees.brokerage = Math.round(baseValue * 0.001 * 100) / 100; // 0.1%
  this.fees.gst = Math.round(this.fees.brokerage * 0.18 * 100) / 100; // 18% on brokerage
  this.fees.stt = Math.round(baseValue * 0.001 * 100) / 100; // 0.1%
  this.fees.stampDuty = Math.round(baseValue * 0.00015 * 100) / 100; // 0.015%
  this.fees.exchangeFee = Math.round(baseValue * 0.0001 * 100) / 100; // 0.01%
  this.fees.clearingFee = Math.round(baseValue * 0.0001 * 100) / 100; // 0.01%
  
  return this.save();
};

transactionSchema.methods.markAsSettled = function() {
  this.settlementStatus = 'settled';
  this.settlementDate = new Date();
  return this.save();
};

transactionSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.settlementStatus = 'failed';
  this.notes = reason;
  return this.save();
};

// Static methods
transactionSchema.statics.getUserTransactionHistory = function(userId, startDate, endDate, limit = 50) {
  const matchStage = {
    $or: [
      { buyerId: new mongoose.Types.ObjectId(userId) }, 
      { sellerId: new mongoose.Types.ObjectId(userId) }
    ],
    status: 'completed'
  };

  if (startDate) {
    matchStage.executedAt = { $gte: startDate };
  }
  
  if (endDate) {
    matchStage.executedAt = { ...matchStage.executedAt, $lte: endDate };
  }

  return this.find(matchStage)
    .sort({ executedAt: -1 })
    .limit(limit);
};

transactionSchema.statics.getBondTradingActivity = function(bondId, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        bondId: bondId,
        executedAt: { $gte: startDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$executedAt' } },
        volume: { $sum: '$quantity' },
        value: { $sum: '$totalValue' },
        transactions: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        highPrice: { $max: '$price' },
        lowPrice: { $min: '$price' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

transactionSchema.statics.getMarketSummary = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        executedAt: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalVolume: { $sum: '$quantity' },
        totalValue: { $sum: '$totalValue' },
        avgTransactionSize: { $avg: '$totalValue' },
        totalFees: { $sum: '$fees.total' },
        uniqueBonds: { $addToSet: '$bondId' },
        uniqueUsers: { $addToSet: { $setUnion: ['$buyerId', '$sellerId'] } }
      }
    },
    {
      $addFields: {
        uniqueBondsCount: { $size: '$uniqueBonds' },
        uniqueUsersCount: { $size: '$uniqueUsers' }
      }
    }
  ]);
};

transactionSchema.statics.getTopTradedBonds = function(limit = 10, days = 7) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        executedAt: { $gte: startDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$bondId',
        bondName: { $first: '$bondName' },
        totalVolume: { $sum: '$quantity' },
        totalValue: { $sum: '$totalValue' },
        transactionCount: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        lastPrice: { $last: '$price' }
      }
    },
    { $sort: { totalValue: -1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('Transaction', transactionSchema);