const mongoose = require('mongoose');

const bondSchema = new mongoose.Schema({
  bondId: {
    type: String,
    required: [true, 'Bond ID is required'],
    unique: true,
    uppercase: true,
    trim: true
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
    required: [true, 'Symbol is required'],
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Financial Details
  faceValue: {
    type: Number,
    required: [true, 'Face value is required'],
    min: [1, 'Face value must be positive'],
    default: 1000
  },
  couponRate: {
    type: Number,
    required: [true, 'Coupon rate is required'],
    min: [0, 'Coupon rate cannot be negative'],
    max: [50, 'Coupon rate cannot exceed 50%']
  },
  currentPrice: {
    type: Number,
    required: [true, 'Current price is required'],
    min: [0, 'Price cannot be negative']
  },
  lastTradedPrice: {
    type: Number,
    default: function() { return this.currentPrice; }
  },
  
  // Market Data
  priceChange: {
    absolute: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    }
  },
  volume: {
    today: {
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
  marketCap: {
    type: Number,
    default: function() {
      return this.totalTokens * this.currentPrice;
    }
  },
  
  // Trading Information
  totalTokens: {
    type: Number,
    required: [true, 'Total tokens is required'],
    min: [1, 'Total tokens must be at least 1']
  },
  availableTokens: {
    type: Number,
    required: [true, 'Available tokens is required'],
    min: [0, 'Available tokens cannot be negative'],
    validate: {
      validator: function(v) {
        return v <= this.totalTokens;
      },
      message: 'Available tokens cannot exceed total tokens'
    }
  },
  minInvestment: {
    type: Number,
    default: 1000,
    min: [100, 'Minimum investment cannot be less than 100']
  },
  
  // Bond Characteristics
  maturityDate: {
    type: Date,
    required: [true, 'Maturity date is required'],
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Maturity date must be in the future'
    }
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  
  // Classification
  sector: {
    type: String,
    required: [true, 'Sector is required'],
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
      'Textiles',
      'Other'
    ]
  },
  
  // Credit Rating
  rating: {
    value: {
      type: String,
      required: [true, 'Credit rating is required'],
      enum: ['AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-', 'BB+', 'BB', 'BB-', 'B+', 'B', 'B-']
    },
    agency: {
      type: String,
      enum: ['CRISIL', 'ICRA', 'CARE', 'Fitch', 'Moody\'s', 'S&P'],
      default: 'CRISIL'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Risk Assessment
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  
  // Yield Calculations
  currentYield: {
    type: Number,
    default: function() {
      return (this.couponRate * this.faceValue) / this.currentPrice;
    }
  },
  yieldToMaturity: {
    type: Number,
    default: 0 // Will be calculated by utility function
  },
  
  // Price History (52 weeks)
  priceHistory: {
    high52Week: {
      type: Number,
      default: function() { return this.currentPrice * 1.1; }
    },
    low52Week: {
      type: Number,
      default: function() { return this.currentPrice * 0.9; }
    }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  tradingStatus: {
    type: String,
    enum: ['active', 'suspended', 'delisted'],
    default: 'active'
  },
  
  // Additional Information
  features: [{
    type: String,
    enum: ['callable', 'puttable', 'convertible', 'secured', 'unsecured']
  }],
  
  // Metadata
  metadata: {
    isin: {
      type: String,
      match: [/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/, 'Invalid ISIN format']
    },
    cusip: String,
    bloomberg: String,
    reuters: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
bondSchema.virtual('daysToMaturity').get(function() {
  const now = new Date();
  const maturity = new Date(this.maturityDate);
  const diffTime = Math.abs(maturity - now);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

bondSchema.virtual('yearsToMaturity').get(function() {
  return Math.round(this.daysToMaturity / 365 * 10) / 10;
});

bondSchema.virtual('tradedTokens').get(function() {
  return this.totalTokens - this.availableTokens;
});

bondSchema.virtual('tradingPercentage').get(function() {
  return ((this.totalTokens - this.availableTokens) / this.totalTokens) * 100;
});

// Indexes for better performance
bondSchema.index({ bondId: 1 });
bondSchema.index({ sector: 1 });
bondSchema.index({ 'rating.value': 1 });
bondSchema.index({ currentPrice: 1 });
bondSchema.index({ maturityDate: 1 });
bondSchema.index({ isActive: 1, tradingStatus: 1 });
bondSchema.index({ couponRate: -1 });
bondSchema.index({ 'volume.today': -1 });

// Pre-save middleware
bondSchema.pre('save', function(next) {
  // Update market cap
  this.marketCap = this.totalTokens * this.currentPrice;
  
  // Calculate current yield
  this.currentYield = (this.couponRate / 100 * this.faceValue) / this.currentPrice * 100;
  
  // Update price change if lastTradedPrice exists
  if (this.lastTradedPrice && this.lastTradedPrice !== this.currentPrice) {
    this.priceChange.absolute = this.currentPrice - this.lastTradedPrice;
    this.priceChange.percentage = (this.priceChange.absolute / this.lastTradedPrice) * 100;
  }
  
  next();
});

// Static methods
bondSchema.statics.getTopPerformers = function(limit = 10) {
  return this.find({ isActive: true, tradingStatus: 'active' })
    .sort({ 'priceChange.percentage': -1 })
    .limit(limit);
};

bondSchema.statics.getHighVolume = function(limit = 10) {
  return this.find({ isActive: true, tradingStatus: 'active' })
    .sort({ 'volume.today': -1 })
    .limit(limit);
};

bondSchema.statics.getBySector = function(sector) {
  return this.find({ sector, isActive: true, tradingStatus: 'active' })
    .sort({ marketCap: -1 });
};

bondSchema.statics.getByRating = function(rating) {
  return this.find({ 'rating.value': rating, isActive: true, tradingStatus: 'active' })
    .sort({ currentYield: -1 });
};

// Instance methods
bondSchema.methods.updatePrice = function(newPrice) {
  this.lastTradedPrice = this.currentPrice;
  this.currentPrice = newPrice;
  
  // Update price change
  this.priceChange.absolute = newPrice - this.lastTradedPrice;
  this.priceChange.percentage = (this.priceChange.absolute / this.lastTradedPrice) * 100;
  
  // Update 52-week high/low
  if (newPrice > this.priceHistory.high52Week) {
    this.priceHistory.high52Week = newPrice;
  }
  if (newPrice < this.priceHistory.low52Week) {
    this.priceHistory.low52Week = newPrice;
  }
  
  return this.save();
};

bondSchema.methods.addVolume = function(tokens) {
  this.volume.today += tokens;
  this.volume.total += tokens;
  return this.save();
};

bondSchema.methods.getRiskColor = function() {
  switch(this.riskLevel) {
    case 'Low': return '#10B981';
    case 'Medium': return '#F59E0B';
    case 'High': return '#EF4444';
    default: return '#6B7280';
  }
};

module.exports = mongoose.model('Bond', bondSchema);