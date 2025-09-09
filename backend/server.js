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

// CORS Configuration - PRECISE PRODUCTION-READY SETUP
console.log('🌍 Environment:', config.server.nodeEnv);
console.log('🔧 CORS Origin:', config.server.corsOrigin);

// Define allowed origins - PRECISE CONFIGURATION
const allowedOrigins = [
  'https://booking4u-1.onrender.com',     // Frontend production URL (Render)
  'https://booking4u-backend.onrender.com', // Alternative frontend URL
  'http://localhost:3000',                // Local development
  'http://127.0.0.1:3000'                 // Alternative local development
];

// Add environment-specific origins if provided
if (config.server.corsOrigin && !allowedOrigins.includes(config.server.corsOrigin)) {
  allowedOrigins.push(config.server.corsOrigin);
}

// PRECISE CORS options - EXACTLY as requested
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Allowed origin:', origin);
      return callback(null, true);
    } else {
      console.log('❌ CORS: Blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// CRITICAL: Apply CORS middleware IMMEDIATELY after express() - BEFORE ALL OTHER MIDDLEWARE
app.use(cors(corsOptions));

// CRITICAL: Handle preflight requests globally - BEFORE ALL OTHER MIDDLEWARE
app.options('*', cors(corsOptions));

// Security middleware - AFTER CORS
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http://localhost:5001", "http://127.0.0.1:5001"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  xssFilter: true // Enable XSS protection
}));

// Request logging middleware
app.use(requestLogger);

// Body parsing middleware with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware for better performance
const compression = require('compression');
app.use(compression());

// Static file serving for uploads with CORS headers
app.use('/uploads', (req, res, next) => {
  // Set CORS headers for static files
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'false');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Set cache headers for images
  if (req.path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    res.header('Cache-Control', 'public, max-age=31536000'); // 1 year
    res.header('Content-Type', 'image/webp'); // Set proper content type
  }
  
  next();
}, express.static('uploads', {
  // Additional static file options
  dotfiles: 'ignore',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Set additional headers for image files
    if (path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }
}));

// Data sanitization middleware
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent HTTP Parameter Pollution

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

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const health = {
      status: 'OK',
      message: 'Booking4U API is running',
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

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', notFoundHandler);

const PORT = config.server.port;

// Only start server if not in test environment
if (config.server.nodeEnv !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 API available at http://localhost:${PORT}/api`);
    console.log(`🌍 Environment: ${config.server.nodeEnv}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });


  // Graceful shutdown handling
  process.on('SIGTERM', gracefulShutdown(server));
  process.on('SIGINT', gracefulShutdown(server));
}

module.exports = app;
