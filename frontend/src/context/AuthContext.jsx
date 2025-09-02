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
  const initializingRef = useRef(false); // Prevent multiple initialization calls

  // Initialize auth on app start
  useEffect(() => {
    const initializeAuth = async () => {
      if (initializingRef.current) return; // Prevent multiple calls
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
          console.error('Token verification failed:', error);
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
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
  };

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
      console.error('Failed to refresh user data:', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    demoLogin,
    logout,
    updateUser,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
