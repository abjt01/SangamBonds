import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Auto-login demo user
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (token) {
          // Verify token with backend
          const response = await axios.get('/api/auth/profile');
          setUser(response.data.user);
        } else {
          // Auto-login demo user for hackathon
          await loginDemoUser();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // If token is invalid, try demo login
        if (token) {
          localStorage.removeItem('token');
          setToken(null);
          await loginDemoUser();
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token]);

  const loginDemoUser = async () => {
    try {
      const demoUser = {
        id: 'demo_user_001',
        name: 'Demo User',
        email: 'demo@sangambonds.com',
        wallet: 50000,
        points: 150,
        holdings: [
          { bondId: 'TATA001', bondName: 'Tata Motors Ltd', tokens: 50, value: 52500 },
          { bondId: 'HDFC001', bondName: 'HDFC Bank Ltd', tokens: 25, value: 25625 }
        ],
        totalTrades: 8,
        kycStatus: 'verified',
        tradingLevel: 'Beginner',
        profileImage: 'https://static.tutordirect.com/prod/media/images/user-avatar-placeholder.max-320x320.png'
      };
      
      setUser(demoUser);
      const demoToken = 'demo_token_' + Date.now();
      setToken(demoToken);
      localStorage.setItem('token', demoToken);
    } catch (error) {
      console.error('Demo login error:', error);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // For demo purposes, always succeed with demo credentials
      if (email === 'demo@sangambonds.com' && password === 'demo123') {
        await loginDemoUser();
        return { success: true };
      }

      // Try real API login
      const response = await axios.post('/api/auth/login', { email, password });
      
      if (response.data.token) {
        const { token: authToken, user: userData } = response.data;
        setToken(authToken);
        setUser(userData);
        localStorage.setItem('token', authToken);
        return { success: true };
      }
      
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback to demo user
      if (email === 'demo@sangambonds.com') {
        await loginDemoUser();
        return { success: true };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/register', { name, email, password });
      
      if (response.data.token) {
        const { token: authToken, user: userData } = response.data;
        setToken(authToken);
        setUser(userData);
        localStorage.setItem('token', authToken);
        return { success: true };
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const updateWallet = (newBalance) => {
    setUser(prev => ({ ...prev, wallet: newBalance }));
  };

  const updatePoints = (newPoints) => {
    setUser(prev => ({ ...prev, points: newPoints }));
  };

  const addHolding = (holding) => {
    setUser(prev => ({
      ...prev,
      holdings: [...(prev.holdings || []), holding]
    }));
  };

  const updateHolding = (bondId, updatedHolding) => {
    setUser(prev => ({
      ...prev,
      holdings: prev.holdings.map(h => 
        h.bondId === bondId ? { ...h, ...updatedHolding } : h
      )
    }));
  };

  const removeHolding = (bondId) => {
    setUser(prev => ({
      ...prev,
      holdings: prev.holdings.filter(h => h.bondId !== bondId)
    }));
  };

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    updateUser,
    updateWallet,
    updatePoints,
    addHolding,
    updateHolding,
    removeHolding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};