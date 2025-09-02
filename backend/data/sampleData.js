const Bond = require('../models/Bond');
const User = require('../models/User');
const logger = require('../utils/logger');

const sampleBonds = [
  {
    bondId: 'HDFC001',
    name: 'HDFC Bank Ltd',
    issuer: 'HDFC Bank Limited',
    symbol: 'HDFCBANK',
    description: 'Tier-2 capital bonds from India\'s largest private bank with strong fundamentals',
    faceValue: 1000,
    couponRate: 6.8,
    currentPrice: 1025.50,
    totalTokens: 150000,
    availableTokens: 95000,
    rating: { value: 'AAA', agency: 'CRISIL' },
    maturityDate: new Date('2030-06-15'),
    sector: 'Banking & Financial Services',
    riskLevel: 'Low',
    currentYield: 6.63,
    yieldToMaturity: 6.45,
    minInvestment: 1000,
    volume: { today: 2500, total: 15000 },
    priceChange: { absolute: 15.50, percentage: 1.54 },
    priceHistory: {
      high52Week: 1085.20,
      low52Week: 925.75
    }
  },
  {
    bondId: 'TATA001',
    name: 'Tata Motors Ltd',
    issuer: 'Tata Motors Limited',
    symbol: 'TATAMOTORS',
    description: 'Senior secured bonds for electric vehicle expansion and modernization',
    faceValue: 1000,
    couponRate: 7.5,
    currentPrice: 1070.29,
    totalTokens: 100000,
    availableTokens: 75000,
    rating: { value: 'AA', agency: 'CRISIL' },
    maturityDate: new Date('2028-12-31'),
    sector: 'Automotive',
    riskLevel: 'Medium',
    currentYield: 7.01,
    yieldToMaturity: 6.85,
    minInvestment: 1000,
    volume: { today: 1800, total: 12500 },
    priceChange: { absolute: -8.25, percentage: -0.76 },
    priceHistory: {
      high52Week: 1125.00,
      low52Week: 985.40
    }
  },
  {
    bondId: 'RIL001',
    name: 'Reliance Industries Ltd',
    issuer: 'Reliance Industries Limited',
    symbol: 'RELIANCE',
    description: 'Corporate bonds for petrochemical and digital services expansion',
    faceValue: 1000,
    couponRate: 6.5,
    currentPrice: 985.75,
    totalTokens: 200000,
    availableTokens: 120000,
    rating: { value: 'AA+', agency: 'CRISIL' },
    maturityDate: new Date('2029-03-20'),
    sector: 'Oil & Gas',
    riskLevel: 'Medium',
    currentYield: 6.59,
    yieldToMaturity: 6.72,
    minInvestment: 1000,
    volume: { today: 3200, total: 28000 },
    priceChange: { absolute: 22.15, percentage: 2.30 },
    priceHistory: {
      high52Week: 1045.80,
      low52Week: 875.25
    }
  },
  {
    bondId: 'ITC001',
    name: 'ITC Limited',
    issuer: 'ITC Limited',
    symbol: 'ITC',
    description: 'Diversified conglomerate bonds with stable cash flows',
    faceValue: 1000,
    couponRate: 6.0,
    currentPrice: 1015.20,
    totalTokens: 125000,
    availableTokens: 88000,
    rating: { value: 'AA+', agency: 'ICRA' },
    maturityDate: new Date('2027-08-10'),
    sector: 'FMCG',
    riskLevel: 'Low',
    currentYield: 5.91,
    yieldToMaturity: 5.85,
    minInvestment: 1000,
    volume: { today: 1650, total: 9800 },
    priceChange: { absolute: 5.80, percentage: 0.58 },
    priceHistory: {
      high52Week: 1065.50,
      low52Week: 945.00
    }
  },
  {
    bondId: 'INFY001',
    name: 'Infosys Limited',
    issuer: 'Infosys Limited',
    symbol: 'INFOSYS',
    description: 'IT services leader with global operations and strong balance sheet',
    faceValue: 1000,
    couponRate: 5.8,
    currentPrice: 1005.90,
    totalTokens: 80000,
    availableTokens: 62000,
    rating: { value: 'AAA', agency: 'CRISIL' },
    maturityDate: new Date('2026-11-25'),
    sector: 'IT Services',
    riskLevel: 'Low',
    currentYield: 5.77,
    yieldToMaturity: 5.65,
    minInvestment: 1000,
    volume: { today: 1200, total: 7500 },
    priceChange: { absolute: 8.90, percentage: 0.89 },
    priceHistory: {
      high52Week: 1055.75,
      low52Week: 955.20
    }
  },
  {
    bondId: 'SAIL001',
    name: 'Steel Authority of India Ltd',
    issuer: 'Steel Authority of India Limited',
    symbol: 'SAIL',
    description: 'Government-backed steel major bonds with infrastructure focus',
    faceValue: 1000,
    couponRate: 8.2,
    currentPrice: 1095.45,
    totalTokens: 90000,
    availableTokens: 45000,
    rating: { value: 'A+', agency: 'CARE' },
    maturityDate: new Date('2028-09-15'),
    sector: 'Metals & Mining',
    riskLevel: 'Medium',
    currentYield: 7.49,
    yieldToMaturity: 7.25,
    minInvestment: 1000,
    volume: { today: 950, total: 6200 },
    priceChange: { absolute: -12.55, percentage: -1.13 },
    priceHistory: {
      high52Week: 1145.00,
      low52Week: 1020.30
    }
  }
];

const sampleUsers = [
  {
    name: 'Demo User',
    email: 'demo@sangambonds.com',
    password: 'demo123',
    wallet: {
      balance: 50000,
      currency: 'INR'
    },
    kycStatus: 'verified',
    trading: {
      points: 150,
      totalTrades: 8,
      totalVolume: 85000,
      profitLoss: 2500,
      level: 'Beginner'
    },
    profile: {
      phone: '+91-9876543210',
      address: {
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India'
      }
    }
  },
  {
    name: 'Test Trader',
    email: 'trader@test.com',
    password: 'test123',
    wallet: {
      balance: 75000,
      currency: 'INR'
    },
    kycStatus: 'verified',
    trading: {
      points: 2500,
      totalTrades: 25,
      totalVolume: 250000,
      profitLoss: 15000,
      level: 'Intermediate'
    }
  },
  {
    name: 'Advanced Investor',
    email: 'investor@test.com',
    password: 'invest123',
    wallet: {
      balance: 200000,
      currency: 'INR'
    },
    kycStatus: 'verified',
    trading: {
      points: 8500,
      totalTrades: 75,
      totalVolume: 850000,
      profitLoss: 45000,
      level: 'Advanced'
    }
  }
];

async function initializeSampleData() {
  try {
    // Initialize bonds
    const existingBonds = await Bond.countDocuments();
    if (existingBonds === 0) {
      for (const bondData of sampleBonds) {
        const bond = new Bond(bondData);
        await bond.save();
      }
      logger.info(`${sampleBonds.length} sample bonds inserted successfully`);
    } else {
      logger.info('Bonds already exist, skipping initialization');
    }

    // Initialize users
    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        logger.info(`Sample user created: ${userData.email}`);
      }
    }

    logger.info('Sample data initialization completed');
  } catch (error) {
    logger.error('Error initializing sample data:', error);
  }
}

module.exports = { initializeSampleData, sampleBonds, sampleUsers };
