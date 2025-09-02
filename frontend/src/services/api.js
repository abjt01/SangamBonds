import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error(error.response.data?.message || 'Access denied');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  demoLogin: () => api.post('/auth/demo-login'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  refreshToken: () => api.post('/auth/refresh-token'),
};

// Bonds API calls
export const bondsAPI = {
  getAllBonds: (params = {}) => api.get('/bonds', { params }),
  getBondById: (bondId) => api.get(`/bonds/${bondId}`),
  getTopPerformers: (limit = 10) => api.get(`/bonds/top-performers?limit=${limit}`),
  getHighVolume: (limit = 10) => api.get(`/bonds/high-volume?limit=${limit}`),
  getBondsBySector: (sector, limit = 20) => api.get(`/bonds/sector/${sector}?limit=${limit}`),
  getBondsByRating: (rating, limit = 20) => api.get(`/bonds/rating/${rating}?limit=${limit}`),
  getMarketOverview: () => api.get('/bonds/market/overview'),
};

// Orders API calls
export const ordersAPI = {
  placeOrder: (orderData) => api.post('/orders', orderData),
  getUserOrders: (params = {}) => api.get('/orders', { params }),
  getOrderById: (orderId) => api.get(`/orders/${orderId}`),
  cancelOrder: (orderId) => api.delete(`/orders/${orderId}`),
  getOrderBook: (bondId, depth = 10) => api.get(`/orders/book/${bondId}?depth=${depth}`),
  getRecentTrades: (bondId, limit = 50) => api.get(`/orders/trades/${bondId}?limit=${limit}`),
  getOrderStats: () => api.get('/orders/stats'),
};

// Portfolio API calls
export const portfolioAPI = {
  getPortfolio: () => api.get('/portfolio'),
  getPortfolioPerformance: (period = '1M') => api.get(`/portfolio/performance?period=${period}`),
  getPortfolioAnalytics: () => api.get('/portfolio/analytics'),
};

// Export the main api instance as default
export default api;
