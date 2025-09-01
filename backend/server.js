const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const bondRoutes = require('./routes/bonds');
const orderRoutes = require('./routes/orders');
const portfolioRoutes = require('./routes/portfolio');
const userRoutes = require('./routes/users');

// Import middleware
const { authenticate } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Import utilities
const logger = require('./utils/logger');
const { initializeSampleData } = require('./data/sampleData');
const matchingEngine = require('./utils/matchingEngine');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sangambonds', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Initialize sample data in development
    if (process.env.NODE_ENV === 'development') {
      await initializeSampleData();
    }
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(mongoSanitize());
app.use(hpp());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SangamBonds API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bonds', bondRoutes);
app.use('/api/orders', authenticate, orderRoutes);
app.use('/api/portfolio', authenticate, portfolioRoutes);
app.use('/api/users', authenticate, userRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Join user-specific room for personalized updates
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    logger.info(`User ${userId} joined their room`);
  });

  // Subscribe to bond updates
  socket.on('subscribe_bond', (bondId) => {
    socket.join(`bond_${bondId}`);
    logger.info(`Socket ${socket.id} subscribed to bond ${bondId}`);
  });

  // Unsubscribe from bond updates
  socket.on('unsubscribe_bond', (bondId) => {
    socket.leave(`bond_${bondId}`);
    logger.info(`Socket ${socket.id} unsubscribed from bond ${bondId}`);
  });

  // Handle order placement through WebSocket
  socket.on('place_order', async (orderData) => {
    try {
      // Process order and emit updates
      const result = await matchingEngine.processOrder(orderData);
      
      if (result.success) {
        // Emit to user
        io.to(`user_${orderData.userId}`).emit('order_placed', result.order);
        
        // Emit market update to all subscribers of this bond
        io.to(`bond_${orderData.bondId}`).emit('market_update', {
          bondId: orderData.bondId,
          type: 'order_placed',
          data: result.order
        });
      }
    } catch (error) {
      logger.error('WebSocket order placement error:', error);
      socket.emit('order_error', { message: 'Order placement failed' });
    }
  });

  socket.on('disconnect', (reason) => {
    logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`);
  });
});

// Make io available globally for other modules
global.io = io;

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

// Start server
if (require.main === module) {
  server.listen(PORT, () => {
    logger.info(`🚀 SangamBonds server running on port ${PORT}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
    logger.info(`🌐 API available at: http://localhost:${PORT}/api`);
    logger.info(`💡 Health check: http://localhost:${PORT}/api/health`);
    
    if (process.env.NODE_ENV === 'development') {
      logger.info(`💡 Demo user: demo@sangambonds.com / demo123`);
    }
  });
}

module.exports = { app, server, io };