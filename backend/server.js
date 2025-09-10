const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// Import configuration and utilities
const config = require('./config');
const { requestLogger, errorLogger } = require('./utils/logger');
const { errorHandler, notFoundHandler, gracefulShutdown } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const serviceRoutes = require('./routes/services');
const businessRoutes = require('./routes/businesses');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const reviewRoutes = require('./routes/reviews');
const newsRoutes = require('./routes/news');
const notificationRoutes = require('./routes/notifications');

// Import Swagger documentation (optional)
let swaggerUi, swaggerSpecs;
try {
  swaggerUi = require('swagger-ui-express');
  swaggerSpecs = require('./swagger');
} catch (error) {
  console.log('⚠️  Swagger documentation not available:', error.message);
}

const app = express();

// CORS Configuration for Production on Render
console.log('🌍 Environment:', config.server.nodeEnv);

// Define allowed origins for production
const allowedOrigins = [
  'https://booking4u-1.onrender.com',  // Frontend production URL
  'https://booking4u.onrender.com',    // Alternative production URL
  // يمكن إضافة أي نطاقات أخرى تحتاجها
];

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS: Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Configure Helmet for production with security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", ...allowedOrigins]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Request logging middleware
app.use(requestLogger);

// Body parsing middleware with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware for better performance
const compression = require('compression');
app.use(compression());

// Static files with proper CORS headers
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Set cache headers for images
    if (path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

// Data sanitization middleware
app.use(mongoSanitize());
app.use(hpp());

// Rate limiting for API protection
const rateLimit = require('express-rate-limit');
const limiter = rateLimit(config.rateLimit);
app.use('/api/', limiter);

// Connect to MongoDB
mongoose.connect(config.database.uri, config.database.options)
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// MongoDB connection event handlers
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

// API Documentation
if (config.server.enableSwagger && swaggerUi && swaggerSpecs) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
  console.log('📚 API Documentation available at /api-docs');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/notifications', notificationRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'مرحباً بك في Booking4U API - نظام حجز المواعيد الذكي',
    message_en: 'Welcome to Booking4U API - Smart Appointment Booking System',
    version: require('./package.json').version,
    environment: config.server.nodeEnv,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      bookings: '/api/bookings',
      services: '/api/services',
      businesses: '/api/businesses',
      users: '/api/users',
      messages: '/api/messages',
      reviews: '/api/reviews',
      news: '/api/news',
      notifications: '/api/notifications'
    },
    documentation: '/api-docs'
  });
});

// Enhanced health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const health = {
      status: 'OK',
      message: 'الخادم يعمل بشكل صحيح / Booking4U API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.server.nodeEnv,
      version: require('./package.json').version,
      corsOrigin: req.headers.origin,
      allowedOrigins: allowedOrigins,
      checks: {}
    };

    // Database health check
    try {
      await mongoose.connection.db.admin().ping();
      health.checks.database = 'OK';
    } catch (error) {
      health.checks.database = 'ERROR';
      health.status = 'DEGRADED';
    }

    // Memory usage
    health.checks.memory = {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Error logging middleware
app.use(errorLogger);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  
  // Set proper CORS headers for errors
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.status(err.status || 500).json({ 
    error: 'حدث خطأ في الخادم / Server error occurred',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Enhanced 404 handler
app.use('*', (req, res) => {
  // Set CORS headers for 404 responses
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.status(404).json({ 
    error: 'الصفحة غير موجودة / Page not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

const PORT = config.server.port || 10000;

// Only start server if not in test environment
if (config.server.nodeEnv !== 'test') {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 API available at http://0.0.0.0:${PORT}/api`);
    console.log(`🌍 Environment: ${config.server.nodeEnv}`);
    console.log(`📊 Health check: http://0.0.0.0:${PORT}/api/health`);
    console.log(`🔧 CORS enabled for origins: ${allowedOrigins.join(', ')}`);
  });

  // Graceful shutdown handling
  process.on('SIGTERM', gracefulShutdown(server));
  process.on('SIGINT', gracefulShutdown(server));
}

module.exports = app;