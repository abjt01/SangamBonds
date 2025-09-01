const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    wallet: {
        type: Number,
        default: 100000, // Starting balance in INR
        min: 0
    },
    points: {
        type: Number,
        default: 0,
        min: 0
    },
    holdings: [{
        bondId: {
            type: String,
            required: true
        },
        bondName: {
            type: String,
            required: true
        },
        tokens: {
            type: Number,
            required: true,
            min: 0
        },
        averagePrice: {
            type: Number,
            required: true,
            min: 0
        },
        investedAmount: {
            type: Number,
            default: function() {
                return this.tokens * this.averagePrice;
            }
        }
    }],
    totalTrades: {
        type: Number,
        default: 0,
        min: 0
    },
    kycStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    panCard: {
        type: String,
        default: ''
    },
    aadharCard: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    dematAccountNumber: {
        type: String,
        default: ''
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    profileImage: {
        type: String,
        default: 'https://static.tutordirect.com/prod/media/images/user-avatar-placeholder.max-320x320.png'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    achievements: [{
        type: String,
        enum: ['first_trade', 'power_trader', 'bond_collector', 'risk_taker', 'yield_hunter'],
        default: []
    }],
    tradingLevel: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Beginner'
    }
}, {
    timestamps: true
});

// Virtual for total portfolio value
userSchema.virtual('portfolioValue').get(function() {
    return this.holdings.reduce((total, holding) => {
        return total + (holding.tokens * holding.averagePrice);
    }, 0);
});

// Virtual for total wallet value (cash + portfolio)
userSchema.virtual('totalWealthValue').get(function() {
    return this.wallet + this.portfolioValue;
});

// Method to update trading level based on points
userSchema.methods.updateTradingLevel = function() {
    if (this.points >= 10000) {
        this.tradingLevel = 'Expert';
    } else if (this.points >= 5000) {
        this.tradingLevel = 'Advanced';
    } else if (this.points >= 1000) {
        this.tradingLevel = 'Intermediate';
    } else {
        this.tradingLevel = 'Beginner';
    }
    return this.tradingLevel;
};

// Method to add achievement
userSchema.methods.addAchievement = function(achievement) {
    if (!this.achievements.includes(achievement)) {
        this.achievements.push(achievement);
        this.points += 100; // Bonus points for achievement
    }
    return this.achievements;
};

// Method to add holding or update existing
userSchema.methods.addHolding = function(bondId, bondName, tokens, price) {
    const existingHolding = this.holdings.find(h => h.bondId === bondId);
    
    if (existingHolding) {
        // Update existing holding with weighted average price
        const totalTokens = existingHolding.tokens + tokens;
        const totalValue = (existingHolding.tokens * existingHolding.averagePrice) + (tokens * price);
        existingHolding.averagePrice = totalValue / totalTokens;
        existingHolding.tokens = totalTokens;
    } else {
        // Add new holding
        this.holdings.push({
            bondId,
            bondName,
            tokens,
            averagePrice: price
        });
    }
    
    return this.holdings;
};

// Method to remove holding
userSchema.methods.removeHolding = function(bondId, tokens) {
    const holding = this.holdings.find(h => h.bondId === bondId);
    
    if (holding) {
        holding.tokens -= tokens;
        if (holding.tokens <= 0) {
            this.holdings = this.holdings.filter(h => h.bondId !== bondId);
        }
    }
    
    return this.holdings;
};

// Pre-save middleware to update trading level
userSchema.pre('save', function(next) {
    this.updateTradingLevel();
    next();
});

module.exports = mongoose.model('User', userSchema);