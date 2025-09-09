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

// Security middleware
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

// NUCLEAR CORS SOLUTION - ULTRA AGGRESSIVE FIX
console.log('🚨 NUCLEAR CORS SOLUTION ACTIVATED');
console.log('🌍 NODE_ENV:', config.server.nodeEnv);
console.log('🔧 CORS_ORIGIN:', config.server.corsOrigin);

// NUCLEAR CORS - Allow EVERYTHING (TEMPORARY FOR DEBUGGING)
const nuclearCorsOptions = {
  origin: true, // Allow ALL origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD', 'CONNECT', 'TRACE'],
  allowedHeaders: '*', // Allow ALL headers
  exposedHeaders: '*', // Expose ALL headers
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Apply NUCLEAR CORS middleware FIRST
app.use(cors(nuclearCorsOptions));

// NUCLEAR: Handle ALL OPTIONS requests globally
app.options('*', (req, res) => {
  console.log('🚨 NUCLEAR OPTIONS handler activated for:', req.url);
  const origin = req.headers.origin;
  
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD, CONNECT, TRACE');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.header('Access-Control-Expose-Headers', '*');
  
  console.log('✅ NUCLEAR OPTIONS response sent for origin:', origin);
  res.status(200).end();
});

// NUCLEAR: Additional CORS middleware for ALL requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('🚨 NUCLEAR CORS middleware - Origin:', origin, 'Method:', req.method, 'URL:', req.url);
  
  // Set CORS headers for EVERY request
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD, CONNECT, TRACE');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Expose-Headers', '*');
  res.header('Access-Control-Max-Age', '86400');
  
  // Special handling for preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🚨 NUCLEAR preflight handling for:', req.url);
    res.status(200).end();
    return;
  }
  
  next();
});

// NUCLEAR: Additional middleware specifically for API routes
app.use('/api', (req, res, next) => {
  const origin = req.headers.origin;
  console.log('🚨 NUCLEAR API CORS - Origin:', origin, 'Method:', req.method, 'Path:', req.path);
  
  // Force CORS headers for all API routes
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD, CONNECT, TRACE');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Expose-Headers', '*');
  
  if (req.method === 'OPTIONS') {
    console.log('🚨 NUCLEAR API OPTIONS response');
    res.status(200).end();
    return;
  }
  
  next();
});

// CORS is now handled by the main cors middleware above

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
