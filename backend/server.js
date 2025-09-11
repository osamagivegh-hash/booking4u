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

// CORS Configuration - Simplified for Integrated Deployment
console.log('🌍 Environment:', config.server.nodeEnv);

// CORS Configuration for Integrated Deployment
const allowedOrigins = [
  // Development origins
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  
  // Integrated deployment origin (same origin - no CORS needed)
  'https://booking4u-integrated.onrender.com',
  
  // Development with different ports
  'http://localhost:10000',
  'http://127.0.0.1:10000'
];

// Environment detection
const isProduction = config.server.nodeEnv === 'production';
const isRenderDeployment = process.env.RENDER === 'true' || process.env.NODE_ENV === 'production';
const isLocalDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (same-origin requests, mobile apps, etc.)
    if (!origin) {
      console.log('🔓 CORS: Allowing same-origin request');
      return callback(null, true);
    }
    
    // In production/Render deployment, allow specific Render domain
    if (isRenderDeployment && origin === 'https://booking4u-integrated.onrender.com') {
      console.log('✅ CORS: Allowing Render frontend domain:', origin);
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Allowed origin:', origin);
      return callback(null, true);
    }
    
    // Allow localhost for development (dynamic ports)
    if (isLocalDevelopment && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      console.log('✅ CORS: Allowed development origin:', origin);
      return callback(null, true);
    }
    
    // Log blocked origin for debugging
    console.log('❌ CORS: Blocked origin:', origin);
    console.log('🔍 CORS Debug Info:', {
      origin,
      isProduction,
      isRenderDeployment,
      isLocalDevelopment,
      allowedOrigins
    });
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ]
};

// تطبيق middleware الـ CORS
app.use(cors(corsOptions));

// معالجة طلبات preflight بشكل صريح
app.options('*', cors(corsOptions));

// Request logging middleware for debugging
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  
  // Log all requests for debugging
  console.log(`🌐 Request: ${req.method} ${req.path} from origin: ${origin || 'Same origin'} (${userAgent})`);
  
  next();
});

// Configure Helmet with CORS-friendly settings
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "wss:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

// middleware لتسجيل الطلبات
app.use(requestLogger);

// middleware لتحليل البيانات
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// middleware للضغط
const compression = require('compression');
app.use(compression());

// الملفات الثابتة
app.use('/uploads', express.static('uploads'));

// Serve React frontend static files
const path = require('path');
app.use(express.static(path.join(__dirname, 'frontend-build')));

// middleware لتطهير البيانات
app.use(mongoSanitize());
app.use(hpp());

// معدل الحد للطلبات
const rateLimit = require('express-rate-limit');
const limiter = rateLimit(config.rateLimit);
app.use('/api/', limiter);

// Database connection with enhanced error handling and logging
const connectDatabase = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📊 Database URI:', config.database.uri ? 'Set' : 'Not set');
    console.log('⚙️ Database options:', config.database.options);
    
    await mongoose.connect(config.database.uri, config.database.options);
    
    console.log('✅ Successfully connected to MongoDB Atlas');
    console.log('📊 Database name:', mongoose.connection.db.databaseName);
    console.log('🌐 Database host:', mongoose.connection.host);
    console.log('🔌 Database port:', mongoose.connection.port);
    
    // Set up connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('🟢 Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('🔴 Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('🟡 Mongoose disconnected from MongoDB');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('🔍 Error details:', {
      name: error.name,
      code: error.code,
      message: error.message
    });
    
    // Retry connection after 5 seconds
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectDatabase, 5000);
  }
};

// Start database connection
connectDatabase();

// Root route handler
app.get('/', (req, res) => {
  res.json({
    message: 'Booking4U API Server',
    version: require('./package.json').version,
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      corsDebug: '/api/debug/cors',
      corsTest: '/api/test-cors',
      auth: '/api/auth',
      bookings: '/api/bookings',
      services: '/api/services',
      businesses: '/api/businesses',
      users: '/api/users',
      messages: '/api/messages',
      reviews: '/api/reviews',
      news: '/api/news',
      notifications: '/api/notifications'
    }
  });
});

// مسارات API
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/notifications', notificationRoutes);

// Enhanced CORS debug endpoint
app.get('/api/debug/cors', (req, res) => {
  const requestOrigin = req.headers.origin;
  const isAllowed = isRenderDeployment || allowedOrigins.includes(requestOrigin);
  const userAgent = req.headers['user-agent'];
  const referer = req.headers.referer;
  
  const debugInfo = {
    request: {
      origin: requestOrigin,
      userAgent: userAgent,
      referer: referer,
      method: req.method,
      path: req.path,
      headers: {
        'content-type': req.headers['content-type'],
        'authorization': req.headers.authorization ? 'Present' : 'Not present',
        'x-requested-with': req.headers['x-requested-with']
      }
    },
    cors: {
      allowed: isAllowed,
      allowedOrigins: allowedOrigins,
      environment: config.server.nodeEnv,
      corsEnabled: true,
      renderDeployment: isRenderDeployment,
      productionMode: isProduction
    },
    server: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: require('./package.json').version
    },
    message: isAllowed ? '✅ Origin allowed by CORS policy' : '❌ Origin not allowed by CORS policy'
  };
  
  console.log('🔍 CORS Debug Request:', debugInfo);
  res.json(debugInfo);
});

// Enhanced health check endpoint with CORS info
app.get('/api/health', async (req, res) => {
  try {
    const requestOrigin = req.headers.origin;
    const isAllowed = isRenderDeployment || allowedOrigins.includes(requestOrigin);
    
    // Test database connection
    let dbStatus = 'disconnected';
    let dbConnected = false;
    
    try {
      if (mongoose.connection.readyState === 1) {
        // Test with a simple ping
        await mongoose.connection.db.admin().ping();
        dbStatus = 'connected';
        dbConnected = true;
      } else {
        dbStatus = 'disconnected';
        dbConnected = false;
      }
    } catch (dbError) {
      console.error('❌ Database ping failed:', dbError.message);
      dbStatus = 'error';
      dbConnected = false;
    }
    
    const health = {
      status: dbConnected ? 'OK' : 'WARNING',
      message: dbConnected ? 'Server is running correctly' : 'Server running but database disconnected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.server.nodeEnv,
      version: require('./package.json').version,
      cors: {
        origin: requestOrigin,
        allowed: isAllowed,
        allowedOrigins: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
        renderDeployment: isRenderDeployment
      },
      database: {
        connected: dbConnected,
        state: mongoose.connection.readyState,
        status: dbStatus,
        host: mongoose.connection.host || 'unknown',
        port: mongoose.connection.port || 'unknown',
        name: mongoose.connection.name || 'unknown'
      }
    };
    
    console.log('🏥 Health check requested from origin:', requestOrigin);
    console.log('📊 Database status:', dbStatus, 'Connected:', dbConnected);
    
    res.json(health);
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Enhanced CORS test endpoint
app.get('/api/test-cors', (req, res) => {
  const requestOrigin = req.headers.origin;
  const isAllowed = isRenderDeployment && requestOrigin === 'https://booking4u-integrated.onrender.com' || 
                   allowedOrigins.includes(requestOrigin) ||
                   (isLocalDevelopment && requestOrigin && (requestOrigin.includes('localhost') || requestOrigin.includes('127.0.0.1')));
  
  res.json({ 
    message: 'CORS test successful',
    origin: requestOrigin,
    allowed: isAllowed,
    timestamp: new Date().toISOString(),
    environment: {
      isProduction,
      isRenderDeployment,
      isLocalDevelopment
    },
    corsHeaders: {
      'Access-Control-Allow-Origin': requestOrigin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD'
    }
  });
});

// معالجة الأخطاء
app.use(errorLogger);
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(err.status || 500).json({ 
    error: 'حدث خطأ في الخادم',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Serve static files from React build (Integrated Deployment)
if (config.server.nodeEnv === 'production') {
  console.log('📁 Serving static files from:', path.join(__dirname, 'frontend-build'));
  app.use(express.static(path.join(__dirname, 'frontend-build')));
}

// Catch-all handler for React Router (must be after all API routes)
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api/')) {
    if (config.server.nodeEnv === 'production') {
      res.sendFile(path.join(__dirname, 'frontend-build', 'index.html'));
    } else {
      res.status(404).json({ 
        error: 'Frontend not available in development mode',
        message: 'Please run frontend separately with npm run dev:frontend',
        timestamp: new Date().toISOString()
      });
    }
  } else {
    // API routes that don't exist should return 404
    res.status(404).json({ 
      error: 'API endpoint not found',
      path: req.originalUrl,
      timestamp: new Date().toISOString()
    });
  }
});

const PORT = config.server.port || 10000;

// Start server with comprehensive logging
if (config.server.nodeEnv !== 'test') {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(80));
    console.log('🚀 BOOKING4U INTEGRATED SERVER STARTED');
    console.log('='.repeat(80));
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌐 Frontend available at http://0.0.0.0:${PORT}/`);
    console.log(`🔧 API available at http://0.0.0.0:${PORT}/api`);
    console.log(`🌍 Environment: ${config.server.nodeEnv}`);
    console.log(`📊 Health check: http://0.0.0.0:${PORT}/api/health`);
    console.log(`🔧 CORS test: http://0.0.0.0:${PORT}/api/test-cors`);
    console.log(`🐛 Debug endpoint: http://0.0.0.0:${PORT}/api/debug/cors`);
    console.log('');
    console.log('🔒 CORS Configuration:');
    console.log(`   ✅ Same-origin requests: enabled`);
    console.log(`   ✅ Development localhost: enabled`);
    console.log(`   ✅ Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD`);
    console.log('');
    console.log('🎯 Integrated Deployment:');
    console.log(`   ✅ Frontend served from: ${path.join(__dirname, 'frontend-build')}`);
    console.log(`   ✅ React Router catch-all enabled`);
    console.log(`   ✅ No CORS issues (same origin)`);
    console.log('='.repeat(80));
  });

  // Graceful shutdown
  process.on('SIGTERM', gracefulShutdown(server));
  process.on('SIGINT', gracefulShutdown(server));
}

module.exports = app;