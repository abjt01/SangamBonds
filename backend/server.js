const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sangambonds', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Simple in-memory storage for demo (replace with MongoDB models in production)
let bonds = [
    {
        _id: 'TATA001',
        bondId: 'TATA001',
        name: 'Tata Motors Ltd',
        issuer: 'Tata Motors Limited',
        couponRate: 7.5,
        maturity: '2028-12-31',
        currentPrice: 1050,
        totalTokens: 100000,
        availableTokens: 75000,
        rating: 'AA',
        minInvestment: 1000,
        isActive: true,
        sector: 'Automotive',
        faceValue: 1000,
        description: 'Senior secured bonds for electric vehicle expansion',
        riskLevel: 'Medium'
    },
    {
        _id: 'HDFC001',
        bondId: 'HDFC001',
        name: 'HDFC Bank Ltd',
        issuer: 'HDFC Bank Limited',
        couponRate: 6.8,
        maturity: '2030-06-15',
        currentPrice: 1025,
        totalTokens: 150000,
        availableTokens: 95000,
        rating: 'AAA',
        minInvestment: 1000,
        isActive: true,
        sector: 'Banking & Financial Services',
        faceValue: 1000,
        description: 'Tier-2 capital bonds from India\'s largest private bank',
        riskLevel: 'Low'
    },
    {
        _id: 'REL001',
        bondId: 'REL001',
        name: 'Reliance Industries',
        issuer: 'Reliance Industries Limited',
        couponRate: 8.2,
        maturity: '2027-03-20',
        currentPrice: 1080,
        totalTokens: 200000,
        availableTokens: 120000,
        rating: 'AA+',
        minInvestment: 1000,
        isActive: true,
        sector: 'Oil & Gas / Petrochemicals',
        faceValue: 1000,
        description: 'Corporate bonds for renewable energy and petrochemical expansion',
        riskLevel: 'Medium'
    }
];

let users = [
    {
        _id: 'demo_user_001',
        name: 'Demo User',
        email: 'demo@sangambonds.com',
        password: '$2a$10$rOl4FQw7xGzn8f9v8rU/h.OJyV5V8f7s8r9s8f7s8r9s8f7s8r9s8f', // demo123
        wallet: 50000,
        points: 0,
        holdings: [
            { bondId: 'TATA001', bondName: 'Tata Motors Ltd', tokens: 50, averagePrice: 1050 },
            { bondId: 'HDFC001', bondName: 'HDFC Bank Ltd', tokens: 25, averagePrice: 1025 }
        ],
        totalTrades: 0,
        kycStatus: 'verified',
        isActive: true
    }
];

let orders = [];
let transactions = [];
let leaderboard = [
    { rank: 1, name: 'Priya Sharma', points: 2850, trades: 45 },
    { rank: 2, name: 'Raj Patel', points: 2640, trades: 38 },
    { rank: 3, name: 'Anita Singh', points: 2430, trades: 41 },
    { rank: 4, name: 'Demo User', points: 0, trades: 0 },
    { rank: 5, name: 'Vikram Kumar', points: 1890, trades: 28 }
];

// Routes

// Get all bonds
app.get('/api/bonds', (req, res) => {
    try {
        const activeBonds = bonds.filter(bond => bond.isActive);
        res.json(activeBonds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get bond by ID
app.get('/api/bonds/:id', (req, res) => {
    try {
        const bond = bonds.find(b => b._id === req.params.id);
        if (!bond) {
            return res.status(404).json({ message: 'Bond not found' });
        }
        res.json(bond);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Place order
app.post('/api/orders', async (req, res) => {
    try {
        const { userId = 'demo_user_001', bondId, orderType, amount, price } = req.body;

        // Validate user exists
        const user = users.find(u => u._id === userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate bond exists
        const bond = bonds.find(b => b._id === bondId);
        if (!bond) {
            return res.status(404).json({ message: 'Bond not found' });
        }

        // Check if user has sufficient balance for buy orders
        if (orderType === 'buy' && user.wallet < (amount * price)) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Check if user has sufficient tokens for sell orders
        if (orderType === 'sell') {
            const userHolding = user.holdings.find(h => h.bondId === bondId);
            if (!userHolding || userHolding.tokens < amount) {
                return res.status(400).json({ message: 'Insufficient tokens' });
            }
        }

        // Create new order
        const newOrder = {
            _id: 'order_' + Date.now(),
            userId,
            bondId,
            orderType,
            amount: parseInt(amount),
            price: parseFloat(price),
            status: 'open',
            createdAt: new Date()
        };

        orders.push(newOrder);

        // Try to match orders (simple matching for demo)
        await matchOrders(bondId);

        // Award points for placing order
        user.points += 5;

        res.status(201).json({ 
            message: 'Order placed successfully', 
            order: newOrder,
            userPoints: user.points 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Simple order matching function
async function matchOrders(bondId) {
    try {
        // Get all open buy orders (highest price first)
        const buyOrders = orders.filter(o => 
            o.bondId === bondId && 
            o.orderType === 'buy' && 
            o.status === 'open'
        ).sort((a, b) => b.price - a.price);

        // Get all open sell orders (lowest price first)
        const sellOrders = orders.filter(o => 
            o.bondId === bondId && 
            o.orderType === 'sell' && 
            o.status === 'open'
        ).sort((a, b) => a.price - b.price);

        // Match orders
        for (let buyOrder of buyOrders) {
            for (let sellOrder of sellOrders) {
                if (buyOrder.price >= sellOrder.price && 
                    buyOrder.status === 'open' && 
                    sellOrder.status === 'open') {
                    
                    const matchAmount = Math.min(buyOrder.amount, sellOrder.amount);
                    const executionPrice = sellOrder.price;

                    // Create transaction
                    const transaction = {
                        _id: 'txn_' + Date.now(),
                        buyOrderId: buyOrder._id,
                        sellOrderId: sellOrder._id,
                        bondId: bondId,
                        amount: matchAmount,
                        price: executionPrice,
                        createdAt: new Date()
                    };
                    transactions.push(transaction);

                    // Update orders
                    buyOrder.amount -= matchAmount;
                    sellOrder.amount -= matchAmount;

                    if (buyOrder.amount === 0) buyOrder.status = 'filled';
                    if (sellOrder.amount === 0) sellOrder.status = 'filled';

                    // Update user balances
                    const buyer = users.find(u => u._id === buyOrder.userId);
                    const seller = users.find(u => u._id === sellOrder.userId);
                    
                    if (buyer && seller) {
                        // Update buyer
                        buyer.wallet -= (matchAmount * executionPrice);
                        let buyerHolding = buyer.holdings.find(h => h.bondId === bondId);
                        if (buyerHolding) {
                            buyerHolding.tokens += matchAmount;
                        } else {
                            const bond = bonds.find(b => b._id === bondId);
                            buyer.holdings.push({
                                bondId: bondId,
                                bondName: bond.name,
                                tokens: matchAmount,
                                averagePrice: executionPrice
                            });
                        }

                        // Update seller
                        seller.wallet += (matchAmount * executionPrice);
                        let sellerHolding = seller.holdings.find(h => h.bondId === bondId);
                        if (sellerHolding) {
                            sellerHolding.tokens -= matchAmount;
                            if (sellerHolding.tokens <= 0) {
                                seller.holdings = seller.holdings.filter(h => h.bondId !== bondId);
                            }
                        }

                        // Award trading points
                        buyer.points += Math.floor(matchAmount / 10);
                        seller.points += Math.floor(matchAmount / 10);
                        buyer.totalTrades = (buyer.totalTrades || 0) + 1;
                        seller.totalTrades = (seller.totalTrades || 0) + 1;
                    }

                    // Update bond price
                    const bond = bonds.find(b => b._id === bondId);
                    if (bond) {
                        bond.currentPrice = executionPrice;
                    }

                    console.log(`Matched order: ${matchAmount} tokens at ₹${executionPrice}`);
                }
            }
        }
    } catch (error) {
        console.error('Error in order matching:', error);
    }
}

// Get user orders
app.get('/api/orders/:userId', (req, res) => {
    try {
        const userOrders = orders.filter(o => o.userId === req.params.userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(userOrders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user wallet
app.get('/api/wallet/:userId', (req, res) => {
    try {
        const user = users.find(u => u._id === req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const totalValue = user.holdings.reduce((sum, holding) => {
            return sum + (holding.tokens * holding.averagePrice);
        }, 0);

        const walletData = {
            balance: user.wallet,
            points: user.points,
            holdings: user.holdings.map(h => ({
                ...h,
                value: h.tokens * h.averagePrice
            })),
            totalValue: totalValue
        };

        res.json(walletData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
    try {
        // Update demo user's position in leaderboard
        const demoUser = users.find(u => u.email === 'demo@sangambonds.com');
        if (demoUser) {
            const demoLeader = leaderboard.find(l => l.name === 'Demo User');
            if (demoLeader) {
                demoLeader.points = demoUser.points;
                demoLeader.trades = demoUser.totalTrades;
            }
        }
        
        // Sort leaderboard by points
        const sortedLeaderboard = leaderboard
            .sort((a, b) => b.points - a.points)
            .map((leader, index) => ({
                ...leader,
                rank: index + 1
            }));

        res.json(sortedLeaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current prices for all bonds
app.get('/api/prices', (req, res) => {
    try {
        const prices = bonds.map(bond => ({
            bondId: bond._id,
            bondName: bond.name,
            currentPrice: bond.currentPrice,
            lastUpdated: new Date()
        }));
        res.json(prices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// User registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = {
            _id: 'user_' + Date.now(),
            name,
            email,
            password: hashedPassword,
            wallet: 100000, // Starting balance
            points: 0,
            holdings: [],
            totalTrades: 0,
            kycStatus: 'pending',
            isActive: true
        };

        users.push(newUser);

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET || 'sangambonds_secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                wallet: newUser.wallet,
                points: newUser.points
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// User login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // For demo user, allow simple password check
        let isPasswordValid = false;
        if (email === 'demo@sangambonds.com' && password === 'demo123') {
            isPasswordValid = true;
        } else {
            isPasswordValid = await bcrypt.compare(password, user.password);
        }

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'sangambonds_secret',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                wallet: user.wallet,
                points: user.points
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'SangamBonds API is running',
        timestamp: new Date(),
        bonds: bonds.length,
        users: users.length,
        orders: orders.length
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 SangamBonds server running on port ${PORT}`);
    console.log(`📊 API endpoints available:`);
    console.log(`   GET  http://localhost:${PORT}/api/bonds - Get all bonds`);
    console.log(`   POST http://localhost:${PORT}/api/orders - Place order`);
    console.log(`   GET  http://localhost:${PORT}/api/wallet/demo_user_001 - Get demo wallet`);
    console.log(`   GET  http://localhost:${PORT}/api/leaderboard - Get leaderboard`);
    console.log(`   POST http://localhost:${PORT}/api/auth/login - Login (demo@sangambonds.com/demo123)`);
    console.log(`   GET  http://localhost:${PORT}/api/health - Health check`);
    console.log(`💡 Demo user: demo@sangambonds.com / demo123`);
});

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('📄 Connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
    console.error('❌ MongoDB connection error:', error);
    console.log('💡 Running in memory mode - data will not persist');
});

mongoose.connection.on('disconnected', () => {
    console.log('📄 Disconnected from MongoDB - running in memory mode');
});