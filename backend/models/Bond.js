const mongoose = require('mongoose');

const bondSchema = new mongoose.Schema({
    bondId: {
        type: String,
        required: [true, 'Bond ID is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    name: {
        type: String,
        required: [true, 'Bond name is required'],
        trim: true
    },
    issuer: {
        type: String,
        required: [true, 'Issuer name is required'],
        trim: true
    },
    symbol: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    series: {
        type: String,
        default: 'A',
        trim: true
    },
    bondType: {
        type: String,
        enum: ['Corporate', 'Government', 'Municipal', 'Convertible'],
        default: 'Corporate'
    },
    couponRate: {
        type: Number,
        required: [true, 'Coupon rate is required'],
        min: 0,
        max: 25 // Maximum 25% coupon rate
    },
    faceValue: {
        type: Number,
        required: [true, 'Face value is required'],
        default: 1000,
        min: 100
    },
    currentPrice: {
        type: Number,
        required: [true, 'Current price is required'],
        min: 0
    },
    ltp: {
        type: Number, // Last Traded Price
        default: function() {
            return this.currentPrice;
        }
    },
    change: {
        type: Number,
        default: 0 // Price change percentage
    },
    totalTokens: {
        type: Number,
        required: [true, 'Total tokens is required'],
        min: 1000,
        max: 10000000
    },
    availableTokens: {
        type: Number,
        required: [true, 'Available tokens is required'],
        min: 0,
        validate: {
            validator: function(v) {
                return v <= this.totalTokens;
            },
            message: 'Available tokens cannot exceed total tokens'
        }
    },
    volume: {
        type: Number,
        default: 0, // Trading volume
        min: 0
    },
    value: {
        type: Number,
        default: function() {
            return this.volume * this.currentPrice;
        }
    },
    rating: {
        type: String,
        enum: ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-', 'BB+', 'BB', 'BB-'],
        required: [true, 'Credit rating is required']
    },
    ratingAgency: {
        type: String,
        enum: ['CRISIL', 'ICRA', 'CARE', 'Fitch', 'Moody\'s', 'S&P'],
        default: 'CRISIL'
    },
    maturity: {
        type: Date,
        required: [true, 'Maturity date is required'],
        validate: {
            validator: function(v) {
                return v > new Date();
            },
            message: 'Maturity date must be in the future'
        }
    },
    minInvestment: {
        type: Number,
        default: 1000,
        min: 100,
        max: 100000
    },
    sector: {
        type: String,
        enum: [
            'Banking & Financial Services',
            'Automotive',
            'Oil & Gas',
            'Petrochemicals',
            'Infrastructure',
            'Power & Utilities',
            'Telecommunications',
            'Real Estate',
            'FMCG',
            'Pharmaceuticals',
            'IT Services',
            'Metals & Mining',
            'Textiles'
        ],
        required: [true, 'Sector is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        minlength: 20,
        maxlength: 500
    },
    riskLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    listingDate: {
        type: Date,
        default: Date.now
    },
    userTrades: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    // Yield calculations
    currentYield: {
        type: Number,
        default: function() {
            return (this.couponRate / (this.currentPrice / this.faceValue)) * 100;
        }
    },
    yieldToMaturity: {
        type: Number,
        default: function() {
            // Simplified YTM calculation
            const timeToMaturity = (this.maturity - new Date()) / (1000 * 60 * 60 * 24 * 365);
            const annualCoupon = this.faceValue * (this.couponRate / 100);
            return ((annualCoupon + (this.faceValue - this.currentPrice) / timeToMaturity) / 
                   ((this.faceValue + this.currentPrice) / 2)) * 100;
        }
    },
    // Performance metrics
    highPrice52Week: {
        type: Number,
        default: function() {
            return this.currentPrice * 1.1; // Mock 52-week high
        }
    },
    lowPrice52Week: {
        type: Number,
        default: function() {
            return this.currentPrice * 0.9; // Mock 52-week low
        }
    }
}, {
    timestamps: true
});

// Virtual for market capitalization
bondSchema.virtual('marketCap').get(function() {
    return this.totalTokens * this.currentPrice;
});

// Virtual for days to maturity
bondSchema.virtual('daysToMaturity').get(function() {
    return Math.ceil((this.maturity - new Date()) / (1000 * 60 * 60 * 24));
});

// Virtual for years to maturity
bondSchema.virtual('yearsToMaturity').get(function() {
    return Math.round(this.daysToMaturity / 365 * 10) / 10;
});

// Method to update price and calculate change
bondSchema.methods.updatePrice = function(newPrice) {
    const oldPrice = this.currentPrice;
    this.ltp = this.currentPrice; // Set last traded price
    this.currentPrice = newPrice;
    this.change = ((newPrice - oldPrice) / oldPrice) * 100;
    return this;
};

// Method to execute trade (reduce available tokens)
bondSchema.methods.executeTrade = function(tokens) {
    if (this.availableTokens >= tokens) {
        this.availableTokens -= tokens;
        this.volume += tokens;
        return true;
    }
    return false;
};

// Method to get risk color for UI
bondSchema.methods.getRiskColor = function() {
    switch(this.riskLevel) {
        case 'Low': return '#10B981'; // Green
        case 'Medium': return '#F59E0B'; // Yellow
        case 'High': return '#EF4444'; // Red
        default: return '#6B7280'; // Gray
    }
};

// Method to get rating score for sorting
bondSchema.methods.getRatingScore = function() {
    const ratingMap = {
        'AAA': 10, 'AA+': 9, 'AA': 8, 'AA-': 7,
        'A+': 6, 'A': 5, 'A-': 4,
        'BBB+': 3, 'BBB': 2, 'BBB-': 1,
        'BB+': 0, 'BB': -1, 'BB-': -2
    };
    return ratingMap[this.rating] || 0;
};

// Index for efficient queries
bondSchema.index({ bondId: 1 });
bondSchema.index({ sector: 1 });
bondSchema.index({ rating: 1 });
bondSchema.index({ maturity: 1 });
bondSchema.index({ isActive: 1 });
bondSchema.index({ currentPrice: 1 });

module.exports = mongoose.model('Bond', bondSchema);