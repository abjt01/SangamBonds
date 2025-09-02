const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Bond = require('../models/Bond');
const User = require('../models/User');
const logger = require('./logger');

class MatchingEngine {
  static async processOrder(order, bond) {
    try {
      logger.info(`Processing order: ${order.orderId}`);

      const result = {
        order: order,
        transactions: [],
        totalExecuted: 0,
        avgExecutionPrice: 0,
        tokensTraded: 0
      };

      // For market orders, execute immediately at current price
      if (order.orderSubType === 'market') {
        return await this.executeMarketOrder(order, bond, result);
      }

      // For limit orders, try to match with existing orders
      return await this.executeLimitOrder(order, bond, result);

    } catch (error) {
      logger.error('Error in matching engine:', error);
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
        await order.executePartial(executeQty, marketPrice);

        // Create a mock transaction for now
        const transaction = {
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          buyOrderId: order.orderType === 'buy' ? order._id : 'MARKET_MAKER',
          sellOrderId: order.orderType === 'sell' ? order._id : 'MARKET_MAKER',
          buyerId: order.orderType === 'buy' ? order.userId : 'system',
          sellerId: order.orderType === 'sell' ? order.userId : 'system',
          bondId: order.bondId,
          bondName: order.bondName,
          quantity: executeQty,
          price: marketPrice,
          totalValue: executeQty * marketPrice,
          status: 'completed',
          executedAt: new Date()
        };

        result.transactions.push(transaction);
        result.totalExecuted = executeQty;
        result.avgExecutionPrice = marketPrice;
        result.tokensTraded = executeQty;

        // Update user balance
        await this.updateUserBalance(order, executeQty, marketPrice);

        logger.info(`Market order executed: ${executeQty} tokens at ${marketPrice}`);
      }

      result.order = order;
      return result;

    } catch (error) {
      logger.error('Error executing market order:', error);
      throw error;
    }
  }

  static async executeLimitOrder(order, bond, result) {
    try {
      // For now, just add to order book (no matching logic)
      order.status = 'open';
      await order.save();

      result.order = order;
      return result;

    } catch (error) {
      logger.error('Error executing limit order:', error);
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

      await user.save();
      logger.info(`Updated balance for user ${order.userId}: ${user.wallet.balance}`);

    } catch (error) {
      logger.error('Error updating user balance:', error);
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
      logger.error('Error cleaning up expired orders:', error);
      return 0;
    }
  }
}

module.exports = MatchingEngine;
