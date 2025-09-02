import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const { user } = useAuth();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Market data subscriptions
  const [subscribedBonds, setSubscribedBonds] = useState(new Set());
  const [marketData, setMarketData] = useState({});

  useEffect(() => {
    if (user) {
      initializeWebSocket();
    } else {
      cleanupWebSocket();
    }

    return () => {
      cleanupWebSocket();
    };
  }, [user]);

  const initializeWebSocket = () => {
    if (socket) {
      socket.disconnect();
    }

    const newSocket = io(process.env.REACT_APP_WS_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
      setReconnecting(false);
      reconnectAttempts.current = 0;
      
      // Join user room
      if (user?.id) {
        newSocket.emit('join_user_room', user.id);
      }
      
      // Re-subscribe to bonds if any
      subscribedBonds.forEach(bondId => {
        newSocket.emit('subscribe_bond', bondId);
      });
      
      toast.success('Connected to real-time updates');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setConnected(false);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, reconnect manually
        setTimeout(() => {
          if (reconnectAttempts.current < maxReconnectAttempts) {
            setReconnecting(true);
            reconnectAttempts.current++;
            newSocket.connect();
          }
        }, 1000 * reconnectAttempts.current);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnected(false);
      
      if (reconnectAttempts.current < maxReconnectAttempts) {
        setReconnecting(true);
        reconnectAttempts.current++;
        setTimeout(() => {
          newSocket.connect();
        }, 1000 * reconnectAttempts.current);
      } else {
        toast.error('Failed to connect to real-time updates');
      }
    });

    // Market data events
    newSocket.on('price_update', (data) => {
      setMarketData(prev => ({
        ...prev,
        [data.bondId]: {
          ...prev[data.bondId],
          currentPrice: data.newPrice,
          priceChange: data.priceChange,
          timestamp: data.timestamp
        }
      }));
      
      toast.success(`${data.bondId} price updated to ₹${data.newPrice}`);
    });

    newSocket.on('market_update', (data) => {
      setMarketData(prev => ({
        ...prev,
        [data.bondId]: {
          ...prev[data.bondId],
          ...data,
          timestamp: new Date()
        }
      }));
    });

    newSocket.on('trade_executed', (data) => {
      setMarketData(prev => ({
        ...prev,
        [data.bondId]: {
          ...prev[data.bondId],
          lastTradePrice: data.price,
          lastTradeQuantity: data.quantity,
          lastTradeTime: data.timestamp
        }
      }));
    });

    // Order events
    newSocket.on('order_placed', (data) => {
      toast.success(`Order ${data.orderId} placed successfully`);
    });

    newSocket.on('order_update', (data) => {
      if (data.status === 'filled') {
        toast.success(`Order ${data.order.orderId} executed successfully`);
      } else if (data.status === 'cancelled') {
        toast.info(`Order ${data.order.orderId} cancelled`);
      } else if (data.status === 'partial') {
        toast.info(`Order ${data.order.orderId} partially filled`);
      }
    });

    newSocket.on('transaction_completed', (data) => {
      const action = data.type === 'buy' ? 'Bought' : 'Sold';
      toast.success(`${action} ${data.transaction.quantity} tokens of ${data.transaction.bondName}`);
    });

    newSocket.on('order_error', (data) => {
      toast.error(data.message || 'Order failed');
    });

    setSocket(newSocket);
  };

  const cleanupWebSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setConnected(false);
    setSubscribedBonds(new Set());
    setMarketData({});
  };

  const subscribeToBond = (bondId) => {
    if (socket && connected) {
      socket.emit('subscribe_bond', bondId);
      setSubscribedBonds(prev => new Set([...prev, bondId]));
    }
  };

  const unsubscribeFromBond = (bondId) => {
    if (socket && connected) {
      socket.emit('unsubscribe_bond', bondId);
      setSubscribedBonds(prev => {
        const newSet = new Set(prev);
        newSet.delete(bondId);
        return newSet;
      });
    }
  };

  const placeOrderViaSocket = (orderData) => {
    if (socket && connected) {
      socket.emit('place_order', {
        ...orderData,
        userId: user?.id
      });
      return true;
    }
    return false;
  };

  const getMarketDataForBond = (bondId) => {
    return marketData[bondId] || null;
  };

  const value = {
    socket,
    connected,
    reconnecting,
    subscribedBonds: Array.from(subscribedBonds),
    marketData,
    subscribeToBond,
    unsubscribeFromBond,
    placeOrderViaSocket,
    getMarketDataForBond,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
