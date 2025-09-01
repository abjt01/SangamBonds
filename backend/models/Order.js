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
        required: [true, 'Bond name is required'],
        trim: true
    },
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
    amount: {
        type: Number,
        required: [true, 'Amount (tokens) is required'],
        min: 1
    },
    price: {
        type: Number,
        required: [true, 'Price per token is required'],
        min: 0
    },
    totalValue: {
        type: Number,
        default: function() {
            return this.amount * this.price;
        }
    },
    status: {
        type: String,
        enum: ['open', 'partial', 'filled', 'cancelled', 'expired'],
        default: 'open'
    },
    filledAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    remainingAmount: {
        type: Number,
        default: function() {
            return this.amount;
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
            // Orders expire after 24 hours by default
            return new Date(Date.now() + 24 * 60 * 60 * 1000);
        }
    },
    // Trading session info
    tradingSession: {
        type: String,
        enum: ['pre_market', 'regular', 'post_market'],
        default: 'regular'
    },
    // Order source
    source: {
        type: String,
        enum: ['web', 'mobile', 'api'],
        default: 'web'
    },
    // Special order flags
    isGoodTillCancelled: {
        type: Boolean,
        default: false
    },
    isDayOrder: {
        type: Boolean,
        default: true
    },
    // Partial fill configuration
    allowPartialFill: {
        type: Boolean,
        default: true
    },
    minimumFillAmount: {
        type: Number,
        default: 1,
        min: 1
    },
    // Stop loss specific fields
    stopPrice: {
        type: Number,
        default: null
    },
    triggerPrice: {
        type: Number,
        default: null
    },
    // Execution details
    executionDetails: [{
        executionId: {
            type: String,
            required: true
        },
        executedAmount: {
            type: Number,
            required: true,
            min: 0
        },
        executedPrice: {
            type: Number,
            required: true,
            min: 0
        },
        executedAt: {
            type: Date,
            default: Date.now
        },
        counterpartyOrderId: {
            type: String,
            default: null
        }
    }],
    // Cancellation details
    cancellationReason: {
        type: String,
        enum: ['user_requested', 'insufficient_balance', 'expired', 'system_error', 'market_closed'],
        default: null
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

// Virtual for order completion percentage
orderSchema.virtual('completionPercentage').get(function() {
    return this.amount > 0 ? (this.filledAmount / this.amount) * 100 : 0;
});

// Virtual for remaining value
orderSchema.virtual('remainingValue').get(function() {
    return this.remainingAmount * this.price;
});

// Virtual for profit/loss (for sell orders)
orderSchema.virtual('profitLoss').get(function() {
    if (this.orderType === 'sell' && this.filledAmount > 0) {
        // This would require the original buy price, simplified here
        return (this.averageFilledPrice - this.price) * this.filledAmount;
    }
    return 0;
});

// Method to update order on partial/full execution
orderSchema.methods.executeOrder = function(executedAmount, executedPrice, counterpartyOrderId = null) {
    // Add execution detail
    this.executionDetails.push({
        executionId: 'EXE_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5).toUpperCase(),
        executedAmount: executedAmount,
        executedPrice: executedPrice,
        executedAt: new Date(),
        counterpartyOrderId: counterpartyOrderId
    });

    // Update order amounts and averages
    const previousExecutedValue = this.filledAmount * this.averageFilledPrice;
    const newExecutedValue = executedAmount * executedPrice;
    
    this.filledAmount += executedAmount;
    this.remainingAmount -= executedAmount;
    this.executedValue += newExecutedValue;
    
    // Calculate weighted average filled price
    this.averageFilledPrice = (previousExecutedValue + newExecutedValue) / this.filledAmount;
    
    // Update status
    if (this.remainingAmount <= 0) {
        this.status = 'filled';
    } else if (this.filledAmount > 0) {
        this.status = 'partial';
    }
    
    this.updatedAt = new Date();
    
    return this;
};

// Method to cancel order
orderSchema.methods.cancelOrder = function(reason = 'user_requested', cancelledBy = null) {
    if (this.status === 'open' || this.status === 'partial') {
        this.status = 'cancelled';
        this.cancellationReason = reason;
        this.cancelledAt = new Date();
        this.cancelledBy = cancelledBy;
        this.updatedAt = new Date();
    }
    return this;
};

// Method to check if order is active
orderSchema.methods.isActive = function() {
    return this.status === 'open' || this.status === 'partial';
};

// Method to check if order is expired
orderSchema.methods.isExpired = function() {
    return new Date() > this.expiresAt && !this.isGoodTillCancelled;
};

// Method to get order priority for matching (price-time priority)
orderSchema.methods.getPriority = function() {
    return {
        price: this.orderType === 'buy' ? -this.price : this.price, // Higher buy price = higher priority, Lower sell price = higher priority
        time: this.placedAt.getTime() // Earlier time = higher priority
    };
};

// Static method to find matching orders
orderSchema.statics.findMatchingOrders = function(bondId, orderType) {
    const oppositeType = orderType === 'buy' ? 'sell' : 'buy';
    const sortOrder = orderType === 'buy' ? { price: 1, placedAt: 1 } : { price: -1, placedAt: 1 };
    
    return this.find({
        bondId: bondId,
        orderType: oppositeType,
        status: { $in: ['open', 'partial'] },
        expiresAt: { $gt: new Date() }
    }).sort(sortOrder);
};

// Pre-save middleware to update timestamps
orderSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    if (this.isModified() && this.status !== 'open') {
        // Order has been modified, update remaining amount
        this.remainingAmount = this.amount - this.filledAmount;
    }
    next();
});

// Index for efficient queries
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ bondId: 1, orderType: 1, status: 1 });
orderSchema.index({ status: 1, expiresAt: 1 });
orderSchema.index({ placedAt: 1 });
orderSchema.index({ bondId: 1, price: 1, placedAt: 1 }); // For matching algorithm

module.exports = mongoose.model('Order', orderSchema);