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

// CORS Configuration - Enhanced and Flexible Setup
console.log('🌍 Environment:', config.server.nodeEnv);
console.log('🔧 CORS Origin:', config.server.corsOrigin);

// Define allowed origins - comprehensive list
const allowedOrigins = [
  'https://booking4u-1.onrender.com',  // Frontend production URL
  'https://booking4u.onrender.com',    // Alternative production URL
  'http://localhost:3000',             // Local development
  'http://127.0.0.1:3000'              // Alternative local development
];

// NUCLEAR CORS FIX: Allow all origins for testing (REMOVE IN PRODUCTION)
// Set to true for testing, false for production
const allowAllOriginsForTesting = true; // TEMPORARILY ENABLED FOR DEEP FIX

// Enhanced CORS options with more flexibility
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // TEMPORARY: Allow all origins for testing
    if (allowAllOriginsForTesting) {
      console.log('⚠️  CORS: Allowing all origins (TESTING MODE):', origin);
      return callback(null, true);
    }
    
    // More flexible origin checking
    const originIsWhitelisted = allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || 
      origin.includes(allowedOrigin) ||
      origin.replace(/\/$/, '') === allowedOrigin // Remove trailing slash
    );
    
    if (originIsWhitelisted) {
      console.log('✅ CORS: Allowed origin:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS: Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200
};

// NUCLEAR CORS FIX: Apply multiple CORS layers for maximum compatibility
app.use(cors({
  origin: true, // Allow all origins temporarily
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

// CRITICAL: Handle preflight requests globally - BEFORE ALL OTHER MIDDLEWARE
app.options('*', cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

// Additional CORS layer for maximum compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    console.log('🚀 NUCLEAR CORS: OPTIONS request handled');
    return res.status(200).end();
  }
  
  next();
});

// Enhanced preflight handling for all routes
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    console.log('✅ Preflight request handled for origin:', req.headers.origin || 'no-origin');
    return res.status(200).end();
  }
  next();
});

// Additional manual CORS middleware for comprehensive coverage
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Check if origin is in allowed list
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log('✅ Manual CORS: Allowed origin:', origin);
  }
  
  // Set comprehensive CORS headers
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Manual CORS: OPTIONS request handled');
    return res.status(200).end();
  }
  
  next();
});

// NUCLEAR CORS FIX: Enhanced logging for debugging
app.use((req, res, next) => {
  console.log('🚀 NUCLEAR CORS DEBUG:');
  console.log('  Origin:', req.headers.origin);
  console.log('  Method:', req.method);
  console.log('  Path:', req.path);
  console.log('  Headers:', JSON.stringify(req.headers, null, 2));
  console.log('  User-Agent:', req.headers['user-agent']);
  next();
});

// NUCLEAR CORS FIX: Temporarily disable Helmet to avoid CORS conflicts
// app.use(helmet({
//   contentSecurityPolicy: false, // Temporarily disabled for CORS testing
//   crossOriginEmbedderPolicy: false,
//   crossOriginResourcePolicy: { policy: "cross-origin" },
//   xssFilter: true // Enable XSS protection
// }));

// Request logging middleware
app.use(requestLogger);

// Body parsing middleware with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware for better performance
const compression = require('compression');
app.use(compression());

// Enhanced static file serving with better CORS headers
app.use('/uploads', (req, res, next) => {
  // Enhanced CORS headers for static files
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Static file preflight handled for:', req.path);
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
  // Enhanced static file options
  dotfiles: 'ignore',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Enhanced headers for all static files
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    // Set additional headers for image files
    if (path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      res.setHeader('Content-Type', 'image/webp');
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

    // CORS status
    health.checks.cors = {
      origin: req.headers.origin,
      allowed: allowedOrigins.includes(req.headers.origin),
      testingMode: allowAllOriginsForTesting
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

// NUCLEAR CORS FIX: Test endpoint for CORS verification
app.get('/api/test', (req, res) => {
  console.log('🚀 NUCLEAR CORS: Test endpoint called');
  res.json({ 
    message: 'اختبار الاتصال ناجح / Connection test successful',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin,
    corsStatus: 'Working',
    nuclearFix: 'Active'
  });
});

// Additional simple test endpoint
app.get('/api/simple', (req, res) => {
  console.log('🚀 NUCLEAR CORS: Simple endpoint called');
  res.json({ 
    status: 'OK',
    message: 'Simple test successful',
    cors: 'Working'
  });
});

// Error logging middleware
app.use(errorLogger);

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  
  // Set CORS headers even for errors
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  
  res.status(500).json({ 
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
  res.header('Access-Control-Allow-Credentials', 'true');
  
  res.status(404).json({ 
    error: 'الصفحة غير موجودة / Page not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

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
