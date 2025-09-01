const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  wallet: {
    balance: {
      type: Number,
      default: 100000,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  profile: {
    phone: {
      type: String,
      trim: true
    },
    dateOfBirth: {
      type: Date
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'India'
      }
    },
    avatar: {
      type: String,
      default: 'https://via.placeholder.com/150'
    }
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'submitted', 'verified', 'rejected'],
    default: 'pending'
  },
  kycDocuments: {
    panCard: String,
    aadharCard: String,
    bankAccount: String
  },
  trading: {
    totalTrades: {
      type: Number,
      default: 0
    },
    totalVolume: {
      type: Number,
      default: 0
    },
    profitLoss: {
      type: Number,
      default: 0
    },
    points: {
      type: Number,
      default: 0
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner'
    }
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    language: {
      type: String,
      default: 'en'
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  twoFactorAuth: {
    enabled: {
      type: Boolean,
      default: false
    },
    secret: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for portfolio value
userSchema.virtual('portfolioValue').get(function() {
  // This would be calculated from user's holdings
  return this.wallet.balance; // Simplified for now
});

// Virtual for account locked status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ 'trading.points': -1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update trading statistics
userSchema.methods.updateTradingStats = function(tradeAmount, profitLoss) {
  this.trading.totalTrades += 1;
  this.trading.totalVolume += tradeAmount;
  this.trading.profitLoss += profitLoss;
  this.trading.points += Math.floor(tradeAmount / 1000); // 1 point per 1000 INR traded
  
  // Update level based on points
  if (this.trading.points >= 10000) {
    this.trading.level = 'Expert';
  } else if (this.trading.points >= 5000) {
    this.trading.level = 'Advanced';
  } else if (this.trading.points >= 1000) {
    this.trading.level = 'Intermediate';
  }
  
  return this.save();
};

// Method to handle failed login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    };
  }
  
  return this.updateOne(updates);
};

// Static method to get user leaderboard
userSchema.statics.getLeaderboard = function(limit = 10) {
  return this.find({ isActive: true })
    .select('name trading.points trading.totalTrades trading.profitLoss')
    .sort({ 'trading.points': -1, 'trading.totalTrades': -1 })
    .limit(limit);
};

module.exports = mongoose.model('User', userSchema);