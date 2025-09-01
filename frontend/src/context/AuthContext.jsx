import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
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

  // Initialize auth on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          // Verify token with backend
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          const response = await api.get('/auth/profile');
          setUser(response.data.data.user);
          setToken(savedToken);
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { token: authToken, user: userData } = response.data.data;
        
        setToken(authToken);
        setUser(userData);
        localStorage.setItem('token', authToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        
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
      const response = await api.post('/auth/register', { name, email, password });
      
      if (response.data.success) {
        const { token: authToken, user: userData } = response.data.data;
        
        setToken(authToken);
        setUser(userData);
        localStorage.setItem('token', authToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        
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
      const response = await api.post('/auth/demo-login');
      
      if (response.data.success) {
        const { token: authToken, user: userData } = response.data.data;
        
        setToken(authToken);
        setUser(userData);
        localStorage.setItem('token', authToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        
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
    delete api.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ADD THIS LINE - This fixes the import error:
export { AuthContext };
