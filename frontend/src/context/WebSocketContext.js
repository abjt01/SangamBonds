import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [marketData, setMarketData] = useState({});
  const [orderUpdates, setOrderUpdates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
      autoConnect: false,
      transports: ['websocket'],
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Join user room for personalized updates
      if (user?.id) {
        newSocket.emit('join_user_room', user.id);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Market data updates
    newSocket.on('market_data', (data) => {
      setMarketData(prev => ({
        ...prev,
        [data.bondId]: data
      }));
    });

    // Bulk market data updates
    newSocket.on('market_data_bulk', (dataArray) => {
      const newMarketData = {};
      dataArray.forEach(data => {
        newMarketData[data.bondId] = data;
      });
      setMarketData(prev => ({ ...prev, ...newMarketData }));
    });

    // Order book updates
    newSocket.on('order_book_update', (data) => {
      setMarketData(prev => ({
        ...prev,
        [data.bondId]: {
          ...prev[data.bondId],
          orderBook: data.orderBook
        }
      }));
    });

    // Order status updates
    newSocket.on('order_update', (orderData) => {
      setOrderUpdates(prev => [orderData, ...prev.slice(0, 49)]); // Keep last 50 updates
    });

    // Trade executions
    newSocket.on('trade_executed', (tradeData) => {
      setOrderUpdates(prev => [{
        type: 'trade',
        ...tradeData,
        timestamp: new Date()
      }, ...prev.slice(0, 49)]);
    });

    // Notifications
    newSocket.on('notification', (notification) => {
      setNotifications(prev => [{
        id: Date.now(),
        timestamp: new Date(),
        ...notification
      }, ...prev.slice(0, 99)]); // Keep last 100 notifications
    });

    // Price alerts
    newSocket.on('price_alert', (alertData) => {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'price_alert',
        title: 'Price Alert',
        message: `${alertData.bondName} has reached ₹${alertData.price}`,
        bondId: alertData.bondId,
        timestamp: new Date()
      }, ...prev.slice(0, 99)]);
    });

    // Portfolio updates
    newSocket.on('portfolio_update', (portfolioData) => {
      // This could update user context or trigger portfolio refresh
      setNotifications(prev => [{
        id: Date.now(),
        type: 'portfolio',
        title: 'Portfolio Update',
        message: `Your portfolio has been updated`,
        timestamp: new Date()
      }, ...prev.slice(0, 99)]);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, [user?.id]);

  // Connect when user is available
  useEffect(() => {
    if (socket && user && !isConnected) {
      socket.connect();
    }
  }, [socket, user, isConnected]);

  // Subscribe to bond updates
  const subscribeToBond = (bondId) => {
    if (socket && isConnected) {
      socket.emit('subscribe_bond', bondId);
    }
  };

  // Unsubscribe from bond updates
  const unsubscribeFromBond = (bondId) => {
    if (socket && isConnected) {
      socket.emit('unsubscribe_bond', bondId);
    }
  };

  // Subscribe to multiple bonds
  const subscribeToMultipleBonds = (bondIds) => {
    if (socket && isConnected) {
      socket.emit('subscribe_bonds', bondIds);
    }
  };

  // Send order to backend
  const placeOrder = (orderData) => {
    if (socket && isConnected) {
      socket.emit('place_order', orderData);
    }
  };

  // Cancel order
  const cancelOrder = (orderId) => {
    if (socket && isConnected) {
      socket.emit('cancel_order', orderId);
    }
  };

  // Send message/chat
  const sendMessage = (message) => {
    if (socket && isConnected) {
      socket.emit('send_message', message);
    }
  };

  // Request real-time order book
  const requestOrderBook = (bondId) => {
    if (socket && isConnected) {
      socket.emit('request_order_book', bondId);
    }
  };

  // Set price alert
  const setPriceAlert = (bondId, targetPrice, condition) => {
    if (socket && isConnected) {
      socket.emit('set_price_alert', {
        bondId,
        targetPrice,
        condition, // 'above' or 'below'
        userId: user?.id
      });
    }
  };

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  // Get market data for specific bond
  const getBondMarketData = (bondId) => {
    return marketData[bondId] || null;
  };

  // Get order book for specific bond
  const getBondOrderBook = (bondId) => {
    return marketData[bondId]?.orderBook || null;
  };

  // Reconnect manually
  const reconnect = () => {
    if (socket) {
      socket.disconnect();
      socket.connect();
    }
  };

  const value = {
    socket,
    isConnected,
    marketData,
    orderUpdates,
    notifications,
    subscribeToBond,
    unsubscribeFromBond,
    subscribeToMultipleBonds,
    placeOrder,
    cancelOrder,
    sendMessage,
    requestOrderBook,
    setPriceAlert,
    clearNotifications,
    markNotificationAsRead,
    getBondMarketData,
    getBondOrderBook,
    reconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};