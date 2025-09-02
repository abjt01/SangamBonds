const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Bond = require('../models/Bond');
const Order = require('../models/Order');
const logger = require('../utils/logger');
const mongoose = require('mongoose'); // Add this import

// @desc    Get user portfolio
// @route   GET /api/portfolio
// @access  Private
const getPortfolio = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user transactions - Fix the query
    const transactions = await Transaction.find({
      $or: [
        { buyerId: new mongoose.Types.ObjectId(userId) },
        { sellerId: new mongoose.Types.ObjectId(userId) }
      ],
      status: 'completed'
    }).sort({ executedAt: -1 }).limit(100);

    // Calculate holdings
    const holdingsMap = new Map();

    for (const transaction of transactions) {
      const bondId = transaction.bondId;
      const isBuy = transaction.buyerId.toString() === userId.toString();
      
      if (!holdingsMap.has(bondId)) {
        const bond = await Bond.findOne({ bondId });
        if (!bond) continue;

        holdingsMap.set(bondId, {
          bondId,
          bondName: bond.name,
          symbol: bond.symbol,
          sector: bond.sector,
          rating: bond.rating.value,
          couponRate: bond.couponRate,
          quantity: 0,
          totalInvested: 0,
          currentPrice: bond.currentPrice,
        });
      }

      const holding = holdingsMap.get(bondId);
      
      if (isBuy) {
        holding.quantity += transaction.quantity;
        holding.totalInvested += transaction.totalValue;
      } else {
        holding.quantity -= transaction.quantity;
        holding.totalInvested -= transaction.totalValue;
      }
    }

    // Convert to array and calculate metrics
    const holdings = [];
    const sectorMap = new Map();
    let totalInvested = 0;
    let totalMarketValue = 0;

    for (const [bondId, holding] of holdingsMap) {
      if (holding.quantity <= 0) continue;

      const currentValue = holding.quantity * holding.currentPrice;
      const avgPrice = holding.totalInvested / holding.quantity;
      const pnl = currentValue - holding.totalInvested;
      const pnlPercentage = holding.totalInvested > 0 ? (pnl / holding.totalInvested) * 100 : 0;

      const holdingData = {
        bondId: holding.bondId,
        bondName: holding.bondName,
        symbol: holding.symbol,
        sector: holding.sector,
        rating: holding.rating,
        couponRate: holding.couponRate,
        quantity: holding.quantity,
        avgPrice: avgPrice,
        currentPrice: holding.currentPrice,
        investedValue: holding.totalInvested,
        currentValue: currentValue,
        pnl: pnl,
        pnlPercentage: pnlPercentage,
        weightage: 0 // Will be calculated after total
      };

      holdings.push(holdingData);
      totalInvested += holding.totalInvested;
      totalMarketValue += currentValue;

      // Sector allocation
      if (!sectorMap.has(holding.sector)) {
        sectorMap.set(holding.sector, 0);
      }
      sectorMap.set(holding.sector, sectorMap.get(holding.sector) + currentValue);
    }

    // Calculate weightages
    holdings.forEach(holding => {
      holding.weightage = totalMarketValue > 0 ? (holding.currentValue / totalMarketValue) * 100 : 0;
    });

    // Prepare sector allocation
    const sectorAllocation = [];
    const sectorColors = [
      '#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2', 
      '#00796b', '#f57c00', '#5d4037', '#616161', '#e91e63'
    ];
    
    let colorIndex = 0;
    for (const [sector, value] of sectorMap) {
      sectorAllocation.push({
        name: sector,
        value: totalMarketValue > 0 ? Math.round((value / totalMarketValue) * 100 * 100) / 100 : 0,
        amount: value,
        color: sectorColors[colorIndex % sectorColors.length]
      });
      colorIndex++;
    }

    // Add cash if user has balance
    if (user.wallet.balance > 0) {
      const totalPortfolio = totalMarketValue + user.wallet.balance;
      const cashPercentage = Math.round((user.wallet.balance / totalPortfolio) * 100 * 100) / 100;
      sectorAllocation.push({
        name: 'Cash',
        value: cashPercentage,
        amount: user.wallet.balance,
        color: '#9e9e9e'
      });
    }

    // Get recent transactions (limit to 10)
    const recentTransactions = transactions.slice(0, 10).map(txn => ({
      id: txn.transactionId || txn._id.toString(),
      type: txn.buyerId.toString() === userId.toString() ? 'BUY' : 'SELL',
      bondName: txn.bondName,
      quantity: txn.quantity,
      price: txn.price,
      value: txn.totalValue,
      date: txn.executedAt,
      status: 'Completed'
    }));

    const portfolioData = {
      summary: {
        totalInvested: Math.round(totalInvested),
        totalMarketValue: Math.round(totalMarketValue),
        totalPnL: Math.round(totalMarketValue - totalInvested),
        totalPnLPercentage: totalInvested > 0 ? Math.round(((totalMarketValue - totalInvested) / totalInvested) * 100 * 100) / 100 : 0,
        totalHoldings: holdings.length,
        cashBalance: user.wallet.balance
      },
      holdings,
      sectorAllocation,
      recentTransactions,
      performanceHistory: await generatePerformanceHistory(userId)
    };

    res.json({
      success: true,
      data: portfolioData
    });

  } catch (error) {
    logger.error('Error fetching portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Keep other functions the same...
const getPortfolioPerformance = async (req, res) => {
  try {
    const { period = '1M' } = req.query;
    const userId = req.userId;

    const performanceData = await generatePerformanceHistory(userId, period);

    res.json({
      success: true,
      data: performanceData
    });

  } catch (error) {
    logger.error('Error fetching portfolio performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio performance'
    });
  }
};

const getPortfolioAnalytics = async (req, res) => {
  try {
    const userId = req.userId;

    // Get basic analytics without complex aggregations for now
    const orders = await Order.find({ userId }).limit(100);
    const transactions = await Transaction.find({
      $or: [
        { buyerId: new mongoose.Types.ObjectId(userId) },
        { sellerId: new mongoose.Types.ObjectId(userId) }
      ],
      status: 'completed'
    }).limit(50);

    const analytics = {
      tradingActivity: {
        totalOrders: orders.length,
        completedOrders: orders.filter(o => o.status === 'filled').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
        successRate: orders.length > 0 ? Math.round((orders.filter(o => o.status === 'filled').length / orders.length) * 100) : 0
      },
      transactionSummary: {
        totalTransactions: transactions.length,
        totalVolume: transactions.reduce((sum, t) => sum + t.totalValue, 0),
        avgTransactionSize: transactions.length > 0 ? transactions.reduce((sum, t) => sum + t.totalValue, 0) / transactions.length : 0
      }
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('Error fetching portfolio analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio analytics'
    });
  }
};

// Helper function to generate performance history
async function generatePerformanceHistory(userId, period = '1M') {
  const days = {
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365
  };

  const numDays = days[period] || 30;
  const startDate = new Date(Date.now() - numDays * 24 * 60 * 60 * 1000);
  
  const performanceData = [];
  const user = await User.findById(userId);
  const baseValue = user?.wallet?.balance || 50000;

  // Generate realistic performance data
  let currentValue = baseValue;
  
  for (let i = 0; i <= numDays; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    
    // Add some realistic variance
    const dailyReturn = (Math.random() - 0.5) * 0.02; // ±1% daily variance
    const trend = 0.0001 * i; // Slight upward trend
    currentValue = currentValue * (1 + dailyReturn + trend);
    
    performanceData.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(currentValue),
      invested: baseValue,
      pnl: Math.round(currentValue - baseValue),
      pnlPercentage: Math.round(((currentValue - baseValue) / baseValue) * 100 * 100) / 100
    });
  }

  return performanceData;
}

module.exports = {
  getPortfolio,
  getPortfolioPerformance,
  getPortfolioAnalytics
};
