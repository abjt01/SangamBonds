/**
 * SangamBonds Order Matching Engine
 * Implements price-time priority matching algorithm for bond trading
 */

const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Bond = require('../models/Bond');
const User = require('../models/User');

class MatchingEngine {
    constructor() {
        this.isProcessing = new Map(); // Track bonds currently being processed
    }

    /**
     * Main matching function - matches orders for a specific bond
     * @param {string} bondId - The bond ID to match orders for
     * @returns {Array} Array of matched transactions
     */
    async matchOrders(bondId) {
        // Prevent concurrent matching for same bond
        if (this.isProcessing.get(bondId)) {
            console.log(`Matching already in progress for bond ${bondId}`);
            return [];
        }

        this.isProcessing.set(bondId, true);
        const transactions = [];

        try {
            // Get all open orders for this bond
            const buyOrders = await this.getOrdersForMatching(bondId, 'buy');
            const sellOrders = await this.getOrdersForMatching(bondId, 'sell');

            console.log(`Found ${buyOrders.length} buy orders and ${sellOrders.length} sell orders for ${bondId}`);

            // Match orders using price-time priority
            const matchedTransactions = await this.performMatching(buyOrders, sellOrders, bondId);
            transactions.push(...matchedTransactions);

            // Update bond price if trades occurred
            if (transactions.length > 0) {
                await this.updateBondPrice(bondId, transactions);
            }

        } catch (error) {
            console.error(`Error in order matching for ${bondId}:`, error);
            throw error;
        } finally {
            this.isProcessing.delete(bondId);
        }

        return transactions;
    }

    /**
     * Get orders for matching sorted by price-time priority
     * @param {string} bondId - Bond ID
     * @param {string} orderType - 'buy' or 'sell'
     * @returns {Array} Sorted orders
     */
    async getOrdersForMatching(bondId, orderType) {
        const sortCriteria = orderType === 'buy' 
            ? { price: -1, placedAt: 1 } // Buy: Highest price first, then earliest time
            : { price: 1, placedAt: 1 };  // Sell: Lowest price first, then earliest time

        return await Order.find({
            bondId: bondId,
            orderType: orderType,
            status: { $in: ['open', 'partial'] },
            expiresAt: { $gt: new Date() }
        })
        .sort(sortCriteria)
        .populate('userId', 'name email wallet holdings');
    }

    /**
     * Perform the actual matching between buy and sell orders
     * @param {Array} buyOrders - Sorted buy orders
     * @param {Array} sellOrders - Sorted sell orders
     * @param {string} bondId - Bond ID
     * @returns {Array} Array of transaction objects
     */
    async performMatching(buyOrders, sellOrders, bondId) {
        const transactions = [];
        
        for (const buyOrder of buyOrders) {
            if (buyOrder.remainingAmount <= 0) continue;

            for (const sellOrder of sellOrders) {
                if (sellOrder.remainingAmount <= 0) continue;

                // Check if orders can match (buy price >= sell price)
                if (buyOrder.price >= sellOrder.price) {
                    const matchResult = await this.executeMatch(buyOrder, sellOrder, bondId);
                    
                    if (matchResult) {
                        transactions.push(matchResult);
                        
                        // If buy order is fully filled, move to next buy order
                        if (buyOrder.remainingAmount <= 0) {
                            break;
                        }
                    }
                } else {
                    // No more matches possible for this buy order
                    break;
                }
            }
        }

        return transactions;
    }

    /**
     * Execute a match between two orders
     * @param {Object} buyOrder - Buy order
     * @param {Object} sellOrder - Sell order
     * @param {string} bondId - Bond ID
     * @returns {Object} Transaction object if successful
     */
    async executeMatch(buyOrder, sellOrder, bondId) {
        try {
            // Determine match quantity and price
            const matchQuantity = Math.min(buyOrder.remainingAmount, sellOrder.remainingAmount);
            const matchPrice = this.determineMatchPrice(buyOrder, sellOrder);

            // Validate users have sufficient balance/tokens
            const validationResult = await this.validateMatch(buyOrder, sellOrder, matchQuantity, matchPrice);
            if (!validationResult.valid) {
                console.log(`Match validation failed: ${validationResult.reason}`);
                return null;
            }

            // Execute the match
            const transaction = await this.createTransaction(buyOrder, sellOrder, matchQuantity, matchPrice, bondId);
            await this.updateOrders(buyOrder, sellOrder, matchQuantity, matchPrice);
            await this.updateUserBalances(buyOrder, sellOrder, matchQuantity, matchPrice, bondId);

            console.log(`Match executed: ${matchQuantity} tokens at ₹${matchPrice} for ${bondId}`);
            return transaction;

        } catch (error) {
            console.error('Error executing match:', error);
            return null;
        }
    }

    /**
     * Determine the execution price for a match
     * @param {Object} buyOrder - Buy order
     * @param {Object} sellOrder - Sell order
     * @returns {number} Match price
     */
    determineMatchPrice(buyOrder, sellOrder) {
        // Price priority: Use the price of the order that was placed first
        return buyOrder.placedAt <= sellOrder.placedAt ? buyOrder.price : sellOrder.price;
    }

    /**
     * Validate if a match can be executed
     * @param {Object} buyOrder - Buy order
     * @param {Object} sellOrder - Sell order
     * @param {number} quantity - Match quantity
     * @param {number} price - Match price
     * @returns {Object} Validation result
     */
    async validateMatch(buyOrder, sellOrder, quantity, price) {
        const buyer = buyOrder.userId;
        const seller = sellOrder.userId;
        const totalValue = quantity * price;

        // Check buyer has sufficient balance
        if (buyer.wallet < totalValue) {
            return { valid: false, reason: 'Buyer has insufficient balance' };
        }

        // Check seller has sufficient tokens
        const sellerHolding = seller.holdings.find(h => h.bondId === sellOrder.bondId);
        if (!sellerHolding || sellerHolding.tokens < quantity) {
            return { valid: false, reason: 'Seller has insufficient tokens' };
        }

        // Check users are different
        if (buyer._id.toString() === seller._id.toString()) {
            return { valid: false, reason: 'Cannot trade with yourself' };
        }

        return { valid: true };
    }

    /**
     * Create a transaction record
     * @param {Object} buyOrder - Buy order
     * @param {Object} sellOrder - Sell order
     * @param {number} quantity - Match quantity
     * @param {number} price - Match price
     * @param {string} bondId - Bond ID
     * @returns {Object} Transaction object
     */
    async createTransaction(buyOrder, sellOrder, quantity, price, bondId) {
        const bond = await Bond.findOne({ bondId: bondId });
        
        const transaction = new Transaction({
            buyOrderId: buyOrder._id,
            sellOrderId: sellOrder._id,
            buyerId: buyOrder.userId._id,
            sellerId: sellOrder.userId._id,
            bondId: bondId,
            bondName: bond ? bond.name : 'Unknown Bond',
            amount: quantity,
            price: price,
            totalValue: quantity * price,
            executedAt: new Date(),
            status: 'completed'
        });

        await transaction.save();
        return transaction;
    }

    /**
     * Update orders after a match
     * @param {Object} buyOrder - Buy order
     * @param {Object} sellOrder - Sell order
     * @param {number} quantity - Matched quantity
     * @param {number} price - Match price
     */
    async updateOrders(buyOrder, sellOrder, quantity, price) {
        // Update buy order
        buyOrder.executeOrder(quantity, price, sellOrder._id);
        await buyOrder.save();

        // Update sell order
        sellOrder.executeOrder(quantity, price, buyOrder._id);
        await sellOrder.save();
    }

    /**
     * Update user balances after a match
     * @param {Object} buyOrder - Buy order
     * @param {Object} sellOrder - Sell order
     * @param {number} quantity - Match quantity
     * @param {number} price - Match price
     * @param {string} bondId - Bond ID
     */
    async updateUserBalances(buyOrder, sellOrder, quantity, price, bondId) {
        const totalValue = quantity * price;
        const bond = await Bond.findOne({ bondId: bondId });

        // Update buyer
        const buyer = await User.findById(buyOrder.userId._id);
        buyer.wallet -= totalValue;
        buyer.addHolding(bondId, bond.name, quantity, price);
        buyer.points += Math.floor(quantity / 10); // Award points
        buyer.totalTrades += 1;
        await buyer.save();

        // Update seller
        const seller = await User.findById(sellOrder.userId._id);
        seller.wallet += totalValue;
        seller.removeHolding(bondId, quantity);
        seller.points += Math.floor(quantity / 10); // Award points
        seller.totalTrades += 1;
        await seller.save();
    }

    /**
     * Update bond price based on recent transactions
     * @param {string} bondId - Bond ID
     * @param {Array} transactions - Recent transactions
     */
    async updateBondPrice(bondId, transactions) {
        if (transactions.length === 0) return;

        // Calculate volume-weighted average price from recent transactions
        const totalValue = transactions.reduce((sum, txn) => sum + txn.totalValue, 0);
        const totalVolume = transactions.reduce((sum, txn) => sum + txn.amount, 0);
        const vwap = totalValue / totalVolume;

        const bond = await Bond.findOne({ bondId: bondId });
        if (bond) {
            const oldPrice = bond.currentPrice;
            bond.updatePrice(vwap);
            bond.volume += totalVolume;
            await bond.save();

            console.log(`Updated ${bondId} price from ₹${oldPrice} to ₹${vwap} (${bond.change.toFixed(2)}%)`);
        }
    }

    /**
     * Cancel expired orders
     * @returns {number} Number of orders cancelled
     */
    async cancelExpiredOrders() {
        const expiredOrders = await Order.find({
            status: { $in: ['open', 'partial'] },
            expiresAt: { $lte: new Date() },
            isGoodTillCancelled: false
        });

        let cancelledCount = 0;
        for (const order of expiredOrders) {
            order.cancelOrder('expired');
            await order.save();
            cancelledCount++;
        }

        if (cancelledCount > 0) {
            console.log(`Cancelled ${cancelledCount} expired orders`);
        }

        return cancelledCount;
    }

    /**
     * Get order book for a bond (for display purposes)
     * @param {string} bondId - Bond ID
     * @param {number} depth - Number of price levels to show (default: 5)
     * @returns {Object} Order book with buy/sell orders
     */
    async getOrderBook(bondId, depth = 5) {
        const buyOrders = await Order.find({
            bondId: bondId,
            orderType: 'buy',
            status: { $in: ['open', 'partial'] },
            expiresAt: { $gt: new Date() }
        })
        .sort({ price: -1, placedAt: 1 })
        .limit(depth)
        .select('price remainingAmount placedAt');

        const sellOrders = await Order.find({
            bondId: bondId,
            orderType: 'sell',
            status: { $in: ['open', 'partial'] },
            expiresAt: { $gt: new Date() }
        })
        .sort({ price: 1, placedAt: 1 })
        .limit(depth)
        .select('price remainingAmount placedAt');

        return {
            bondId,
            bids: buyOrders,
            asks: sellOrders,
            timestamp: new Date()
        };
    }
}

// Export singleton instance
module.exports = new MatchingEngine();