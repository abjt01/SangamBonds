import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(process.env.REACT_APP_WS_URL || 'http://localhost:3001');
      
      newSocket.on('connect', () => {
        setConnected(true);
        newSocket.emit('join_user_room', user.id);
      });
      
      newSocket.on('disconnect', () => {
        setConnected(false);
      });
      
      setSocket(newSocket);
      
      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const value = {
    socket,
    connected,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
