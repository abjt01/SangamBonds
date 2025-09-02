const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Bond = require('../models/Bond');
const User = require('../models/User');
const logger = require('./logger');
const mongoose = require('mongoose');

class MatchingEngine {
  static async processOrder(order, bond) {
    try {
      logger.info(`Processing order ${order.orderId}`);
      
      const result = {
        order: order,
        transactions: [],
        totalExecuted: 0,
        avgExecutionPrice: 0,
        tokensTraded: 0,
        success: true
      };

      // For market orders, execute immediately at current price
      if (order.orderSubType === 'market') {
        return await this.executeMarketOrder(order, bond, result);
      }
      
      // For limit orders, try to match with existing orders
      return await this.executeLimitOrder(order, bond, result);
      
    } catch (error) {
      logger.error('Error in matching engine', error);
      throw error;
    }
  }

  static async executeMarketOrder(order, bond, result) {
    try {
      // For market orders, execute immediately at current bond price
      const marketPrice = bond.currentPrice;
      const executeQty = Math.min(order.quantity, bond.availableTokens || order.quantity);

      if (executeQty > 0) {
        // Execute the order partially
        await order.executePartial(executeQty, marketPrice, 'MARKET_MAKER');

        // Create transaction record
        const transaction = await this.createTransaction(order, executeQty, marketPrice, 'MARKET_MAKER');
        result.transactions.push(transaction);
        
        result.totalExecuted = executeQty;
        result.avgExecutionPrice = marketPrice;
        result.tokensTraded = executeQty;

        // Update user balance
        await this.updateUserBalance(order, executeQty, marketPrice);
        
        logger.info(`Market order executed: ${executeQty} tokens at ₹${marketPrice}`);
      }

      result.order = order;
      return result;
      
    } catch (error) {
      logger.error('Error executing market order', error);
      throw error;
    }
  }

  static async executeLimitOrder(order, bond, result) {
    try {
      // Find matching orders in the opposite direction
      const matchingOrders = await this.findMatchingOrders(order, bond);
      
      let remainingQty = order.quantity;
      let totalExecutedValue = 0;
      let totalExecutedQty = 0;

      for (const matchingOrder of matchingOrders) {
        if (remainingQty <= 0) break;

        const matchQty = Math.min(remainingQty, matchingOrder.remainingQuantity);
        const matchPrice = matchingOrder.price; // Price improvement for taker
        
        if (matchQty > 0) {
          // Execute both orders partially
          await order.executePartial(matchQty, matchPrice, matchingOrder.orderId);
          await matchingOrder.executePartial(matchQty, matchPrice, order.orderId);

          // Create transaction
          const transaction = await this.createTransaction(
            order, 
            matchQty, 
            matchPrice, 
            matchingOrder.orderId,
            matchingOrder
          );
          result.transactions.push(transaction);

          totalExecutedQty += matchQty;
          totalExecutedValue += (matchQty * matchPrice);
          remainingQty -= matchQty;

          // Update user balances for both parties
          await this.updateUserBalance(order, matchQty, matchPrice);
          await this.updateUserBalance(matchingOrder, matchQty, matchPrice);

          logger.info(`Limit order matched: ${matchQty} tokens at ₹${matchPrice}`);
        }
      }

      // If partially filled or unfilled, add to order book
      if (remainingQty > 0) {
        order.status = totalExecutedQty > 0 ? 'partial' : 'open';
        await order.save();
      }

      result.totalExecuted = totalExecutedQty;
      result.avgExecutionPrice = totalExecutedQty > 0 ? totalExecutedValue / totalExecutedQty : 0;
      result.tokensTraded = totalExecutedQty;
      result.order = order;
      
      return result;
      
    } catch (error) {
      logger.error('Error executing limit order', error);
      throw error;
    }
  }

  static async findMatchingOrders(order, bond) {
    try {
      const oppositeType = order.orderType === 'buy' ? 'sell' : 'buy';
      let priceCondition = {};

      if (order.orderType === 'buy') {
        // Buy order matches with sell orders at or below limit price
        priceCondition = { price: { $lte: order.price } };
      } else {
        // Sell order matches with buy orders at or above limit price  
        priceCondition = { price: { $gte: order.price } };
      }

      const matchingOrders = await Order.find({
        bondId: bond.bondId,
        orderType: oppositeType,
        status: { $in: ['open', 'partial'] },
        expiresAt: { $gt: new Date() },
        ...priceCondition
      })
      .sort(order.orderType === 'buy' ? { price: 1, placedAt: 1 } : { price: -1, placedAt: 1 })
      .limit(10);

      return matchingOrders;
    } catch (error) {
      logger.error('Error finding matching orders', error);
      return [];
    }
  }

  static async createTransaction(buyOrder, quantity, price, counterpartyId, sellOrder = null) {
    try {
      // Determine buyer and seller based on order types
      let buyerId, sellerId, buyOrderId, sellOrderId;
      
      if (buyOrder.orderType === 'buy') {
        buyerId = buyOrder.userId;
        buyOrderId = buyOrder._id;
        if (sellOrder) {
          sellerId = sellOrder.userId;
          sellOrderId = sellOrder._id;
        } else {
          // Market maker transaction
          sellerId = new mongoose.Types.ObjectId('000000000000000000000001'); // System user
          sellOrderId = new mongoose.Types.ObjectId('000000000000000000000001');
        }
      } else {
        sellerId = buyOrder.userId;
        sellOrderId = buyOrder._id;
        if (sellOrder) {
          buyerId = sellOrder.userId;
          buyOrderId = sellOrder._id;
        } else {
          // Market maker transaction
          buyerId = new mongoose.Types.ObjectId('000000000000000000000001'); // System user
          buyOrderId = new mongoose.Types.ObjectId('000000000000000000000001');
        }
      }

      const transaction = new Transaction({
        buyOrderId,
        sellOrderId,
        buyerId,
        sellerId,
        bondId: buyOrder.bondId,
        bondName: buyOrder.bondName,
        quantity,
        price,
        totalValue: quantity * price,
        status: 'completed',
        executedAt: new Date(),
        transactionType: 'trade'
      });

      // Calculate fees
      await transaction.calculateFees();
      await transaction.save();

      logger.info(`Transaction created: ${transaction.transactionId}`);
      return transaction;
      
    } catch (error) {
      logger.error('Error creating transaction', error);
      throw error;
    }
  }

  static async updateUserBalance(order, quantity, price) {
    try {
      const user = await User.findById(order.userId);
      if (!user) return;

      const orderValue = quantity * price;
      const fees = orderValue * 0.002; // 0.2% total fees

      if (order.orderType === 'buy') {
        user.wallet.balance -= (orderValue + fees);
      } else {
        user.wallet.balance += (orderValue - fees);
      }

      // Update trading statistics
      await user.updateTradingStats(orderValue, 0);
      await user.save();

      logger.info(`Updated balance for user ${order.userId}: ₹${user.wallet.balance}`);
    } catch (error) {
      logger.error('Error updating user balance', error);
    }
  }

  static async cleanupExpiredOrders() {
    try {
      const expiredOrders = await Order.getExpiredOrders();
      for (const order of expiredOrders) {
        await order.expire();
        logger.info(`Order expired: ${order.orderId}`);
      }
      return expiredOrders.length;
    } catch (error) {
      logger.error('Error cleaning up expired orders', error);
      return 0;
    }
  }
}

module.exports = MatchingEngine;
