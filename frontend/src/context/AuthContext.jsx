import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

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
  const [portfolio, setPortfolio] = useState([]);
  const initializingRef = useRef(false);

  // Initialize auth on app start
  useEffect(() => {
    const initializeAuth = async () => {
      if (initializingRef.current) return;
      initializingRef.current = true;

      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const response = await authAPI.getProfile();
          if (response.data.success) {
            setUser(response.data.data.user);
            setToken(savedToken);
          }
        } catch (error) {
          console.error('Token verification failed', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
      initializingRef.current = false;
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      
      if (response.data.success) {
        const { token: authToken, user: userData } = response.data.data;
        setToken(authToken);
        setUser(userData);
        localStorage.setItem('token', authToken);
        toast.success('Login successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.register(name, email, password);
      
      if (response.data.success) {
        const { token: authToken, user: userData } = response.data.data;
        setToken(authToken);
        setUser(userData);
        localStorage.setItem('token', authToken);
        toast.success('Registration successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    try {
      setLoading(true);
      const response = await authAPI.demoLogin();
      
      if (response.data.success) {
        const { token: authToken, user: userData } = response.data.data;
        setToken(authToken);
        setUser(userData);
        localStorage.setItem('token', authToken);
        toast.success('Demo login successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Demo login failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setPortfolio([]);
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
  };

  // REAL ORDER EXECUTION FUNCTION
  const executeOrder = async (orderData) => {
    try {
      const { orderType, quantity, price, bondName, bondId } = orderData;
      const totalValue = quantity * price;
      const fees = totalValue * 0.002; // 0.2% fees
      const netAmount = orderType === 'buy' ? totalValue + fees : totalValue - fees;

      // Update user balance
      const newBalance = orderType === 'buy' 
        ? user.wallet.balance - netAmount
        : user.wallet.balance + netAmount;

      if (orderType === 'buy' && newBalance < 0) {
        throw new Error('Insufficient balance');
      }

      // Update user state
      const updatedUser = {
        ...user,
        wallet: {
          ...user.wallet,
          balance: newBalance
        }
      };
      setUser(updatedUser);

      // Update portfolio
      const existingHolding = portfolio.find(holding => holding.bondId === bondId);
      let newPortfolio;

      if (orderType === 'buy') {
        if (existingHolding) {
          // Update existing holding
          const newQuantity = existingHolding.quantity + quantity;
          const newTotalInvested = existingHolding.totalInvested + totalValue;
          
          newPortfolio = portfolio.map(holding =>
            holding.bondId === bondId
              ? {
                  ...holding,
                  quantity: newQuantity,
                  totalInvested: newTotalInvested,
                  avgPrice: newTotalInvested / newQuantity
                }
              : holding
          );
        } else {
          // Create new holding
          newPortfolio = [
            ...portfolio,
            {
              id: Date.now(),
              bondId,
              bondName,
              quantity,
              totalInvested: totalValue,
              avgPrice: price,
              purchaseDate: new Date(),
              currentPrice: price
            }
          ];
        }
      } else {
        // Sell order
        if (existingHolding && existingHolding.quantity >= quantity) {
          const newQuantity = existingHolding.quantity - quantity;
          
          if (newQuantity === 0) {
            // Remove holding completely
            newPortfolio = portfolio.filter(holding => holding.bondId !== bondId);
          } else {
            // Update holding
            const soldValue = (existingHolding.totalInvested / existingHolding.quantity) * quantity;
            newPortfolio = portfolio.map(holding =>
              holding.bondId === bondId
                ? {
                    ...holding,
                    quantity: newQuantity,
                    totalInvested: existingHolding.totalInvested - soldValue
                  }
                : holding
            );
          }
        } else {
          throw new Error('Insufficient holdings to sell');
        }
      }

      setPortfolio(newPortfolio);

      // Store in localStorage for persistence
      localStorage.setItem('userPortfolio', JSON.stringify(newPortfolio));
      localStorage.setItem('userBalance', newBalance.toString());

      return {
        success: true,
        orderId: `ORD${Date.now()}`,
        executedQuantity: quantity,
        executedPrice: price,
        newBalance
      };

    } catch (error) {
      console.error('Order execution error:', error);
      throw error;
    }
  };

  // Load portfolio from localStorage on init
  useEffect(() => {
    const savedPortfolio = localStorage.getItem('userPortfolio');
    const savedBalance = localStorage.getItem('userBalance');
    
    if (savedPortfolio) {
      setPortfolio(JSON.parse(savedPortfolio));
    }
    
    if (savedBalance && user) {
      setUser(prev => ({
        ...prev,
        wallet: {
          ...prev.wallet,
          balance: parseFloat(savedBalance)
        }
      }));
    }
  }, [user?.id]);

  const updateUser = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      if (response.data.success) {
        setUser(response.data.data.user);
        toast.success('Profile updated successfully');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const refreshUserData = async () => {
    if (!token) return;
    
    try {
      const response = await authAPI.getProfile();
      if (response.data.success) {
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Failed to refresh user data', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    portfolio,
    login,
    register,
    demoLogin,
    logout,
    updateUser,
    refreshUserData,
    executeOrder // Add this new function
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
