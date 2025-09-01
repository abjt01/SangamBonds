const Bond = require('../models/Bond');
const User = require('../models/User');
const logger = require('../utils/logger');

const sampleBonds = [
  {
    bondId: 'TATA001',
    name: 'Tata Motors Ltd',
    issuer: 'Tata Motors Limited',
    symbol: 'TATAMOTORS',
    description: 'Senior secured bonds for electric vehicle expansion',
    faceValue: 1000,
    couponRate: 7.5,
    currentPrice: 1070.29,
    totalTokens: 100000,
    availableTokens: 75000,
    rating: { value: 'AA', agency: 'CRISIL' },
    maturityDate: new Date('2028-12-31'),
    sector: 'Automotive',
    riskLevel: 'Medium'
  },
  {
    bondId: 'HDFC001',
    name: 'HDFC Bank Ltd',
    issuer: 'HDFC Bank Limited',
    symbol: 'HDFCBANK',
    description: 'Tier-2 capital bonds from India\'s largest private bank',
    faceValue: 1000,
    couponRate: 6.8,
    currentPrice: 1025.50,
    totalTokens: 150000,
    availableTokens: 95000,
    rating: { value: 'AAA', agency: 'CRISIL' },
    maturityDate: new Date('2030-06-15'),
    sector: 'Banking & Financial Services',
    riskLevel: 'Low'
  }
];

async function initializeSampleData() {
  try {
    // Check if bonds already exist
    const existingBonds = await Bond.countDocuments();
    if (existingBonds === 0) {
      await Bond.insertMany(sampleBonds);
      logger.info('Sample bonds inserted successfully');
    }

    // Create demo user if not exists
    const demoUser = await User.findOne({ email: 'demo@sangambonds.com' });
    if (!demoUser) {
      const user = new User({
        name: 'Demo User',
        email: 'demo@sangambonds.com',
        password: 'demo123',
        kycStatus: 'verified',
        wallet: { balance: 50000 },
        trading: { points: 150, level: 'Beginner' }
      });
      await user.save();
      logger.info('Demo user created successfully');
    }
  } catch (error) {
    logger.error('Error initializing sample data:', error);
  }
}

module.exports = { initializeSampleData };
