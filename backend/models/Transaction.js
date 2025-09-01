const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        unique: true,
        default: function() {
            return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5).toUpperCase();
        }
    },
    // Order references
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
    // User references
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
    // Bond information
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
    // Transaction details
    amount: {
        type: Number,
        required: [true, 'Transaction amount (tokens) is required'],
        min: 1
    },
    price: {
        type: Number,
        required: [true, 'Transaction price per token is required'],
        min: 0
    },
    totalValue: {
        type: Number,
        required: [true, 'Total transaction value is required'],
        default: function() {
            return this.amount * this.price;
        }
    },
    // Transaction type
    transactionType: {
        type: String,
        enum: ['trade', 'transfer', 'dividend', 'maturity', 'coupon_payment'],
        default: 'trade'
    },
    // Status
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'completed'
    },
    // Settlement details
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
        enum: ['pending', 'settled', 'failed'],
        default: 'pending'
    },
    // Fees and charges
    brokerageFee: {
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
    totalCharges: {
        type: Number,
        default: function() {
            return this.brokerageFee + this.gst + this.stt + this.stampDuty;
        }
    },
    netAmount: {
        type: Number,
        default: function() {
            return this.totalValue - this.totalCharges;
        }
    },
    // Execution details
    executedAt: {
        type: Date,
        default: Date.now
    },
    executionVenue: {
        type: String,
        default: 'SangamBonds Exchange'
    },
    // Market data at execution
    marketPrice: {
        type: Number,
        default: function() {
            return this.price;
        }
    },
    // Trading session
    tradingSession: {
        type: String,
        enum: ['pre_market', 'regular', 'post_market'],
        default: 'regular'
    },
    // Reference numbers for external systems
    exchangeRefNo: {
        type: String,
        default: null
    },
    clearingRefNo: {
        type: String,
        default: null
    },
    // Blockchain/tokenization info
    blockchainTxHash: {
        type: String,
        default: null
    },
    tokenTransferHash: {
        type: String,
        default: null
    },
    // Audit trail
    createdBy: {
        type: String,
        default: 'system'
    },
    modifiedBy: {
        type: String,
        default: 'system'
    },
    // Additional metadata
    metadata: {
        sourceIP: String,
        userAgent: String,
        platform: {
            type: String,
            enum: ['web', 'mobile', 'api'],
            default: 'web'
        }
    }
}, {
    timestamps: true
});

// Virtual for transaction yield (for analysis)
transactionSchema.virtual('yieldAtTransaction').get(function() {
    // This would require bond's coupon rate and maturity info
    // Simplified calculation
    return (this.price / 1000) * 100; // Assuming face value of 1000
});

// Virtual for days since transaction
transactionSchema.virtual('daysSinceTransaction').get(function() {
    return Math.floor((new Date() - this.executedAt) / (1000 * 60 * 60 * 24));
});

// Method to calculate fees based on transaction value
transactionSchema.methods.calculateFees = function() {
    const baseValue = this.totalValue;
    
    // Brokerage: 0.1% of transaction value
    this.brokerageFee = Math.round(baseValue * 0.001 * 100) / 100;
    
    // GST: 18% of brokerage
    this.gst = Math.round(this.brokerageFee * 0.18 * 100) / 100;
    
    // STT: 0.1% of transaction value for bonds
    this.stt = Math.round(baseValue * 0.001 * 100) / 100;
    
    // Stamp duty: 0.015% of transaction value
    this.stampDuty = Math.round(baseValue * 0.00015 * 100) / 100;
    
    this.totalCharges = this.brokerageFee + this.gst + this.stt + this.stampDuty;
    this.netAmount = baseValue - this.totalCharges;
    
    return this.totalCharges;
};

// Method to mark transaction as settled
transactionSchema.methods.settle = function() {
    this.settlementStatus = 'settled';
    this.settlementDate = new Date();
    return this;
};

// Method to generate exchange reference number
transactionSchema.methods.generateExchangeRef = function() {
    this.exchangeRefNo = 'SBE' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
    return this.exchangeRefNo;
};

// Method to generate blockchain hash (mock)
transactionSchema.methods.generateBlockchainHash = function() {
    this.blockchainTxHash = '0x' + Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)).join('');
    return this.blockchainTxHash;
};

// Static method to get transaction summary for a user
transactionSchema.statics.getUserTransactionSummary = function(userId, startDate, endDate) {
    const matchStage = {
        $or: [{ buyerId: userId }, { sellerId: userId }],
        executedAt: {
            $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default: last 30 days
            $lte: endDate || new Date()
        },
        status: 'completed'
    };

    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalTransactions: { $sum: 1 },
                totalVolume: { $sum: '$totalValue' },
                totalTokens: { $sum: '$amount' },
                avgTransactionSize: { $avg: '$totalValue' },
                totalFees: { $sum: '$totalCharges' }
            }
        }
    ]);
};

// Static method to get bond trading activity
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
                volume: { $sum: '$amount' },
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

// Pre-save middleware to calculate fees and generate references
transactionSchema.pre('save', function(next) {
    if (this.isNew) {
        this.calculateFees();
        this.generateExchangeRef();
        this.generateBlockchainHash();
    }
    next();
});

// Index for efficient queries
transactionSchema.index({ buyerId: 1, executedAt: -1 });
transactionSchema.index({ sellerId: 1, executedAt: -1 });
transactionSchema.index({ bondId: 1, executedAt: -1 });
transactionSchema.index({ executedAt: -1 });
transactionSchema.index({ status: 1, settlementStatus: 1 });
transactionSchema.index({ transactionId: 1 }, { unique: true });

module.exports = mongoose.model('Transaction', transactionSchema);