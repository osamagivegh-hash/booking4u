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

// CORS Configuration - Comprehensive Setup
console.log('🌍 Environment:', config.server.nodeEnv);

// Complete list of allowed origins for all environments
const allowedOrigins = [
  // Production Render URLs
  'https://booking4u-1.onrender.com',
  'https://booking4u.onrender.com',
  'https://booking4u-frontend.onrender.com',
  'https://booking4u-backend.onrender.com',
  
  // GitHub Pages
  'https://osamagivegh-hash.github.io',
  'https://osamagivegh-hash.github.io/booking4u',
  
  // Development URLs
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  
  // Alternative development ports
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:5001',
  'http://127.0.0.1:5001',
  
  // Netlify (if used)
  'https://booking4u.netlify.app',
  'https://booking4u-app.netlify.app',
  
  // Vercel (if used)
  'https://booking4u.vercel.app',
  'https://booking4u-app.vercel.app'
];

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('🔓 CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    const isAllowed = allowedOrigins.includes(origin);
    
    if (isAllowed) {
      console.log('✅ CORS: Allowed origin:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS: Blocked origin:', origin);
      console.log('📋 Allowed origins:', allowedOrigins);
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
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
    'Access-Control-Request-Headers',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'Date',
    'Server',
    'X-Request-ID'
  ],
  maxAge: 86400 // 24 hours
};

// تطبيق middleware الـ CORS
app.use(cors(corsOptions));

// معالجة طلبات preflight بشكل صريح
app.options('*', cors(corsOptions));

// Additional CORS middleware as backup and for specific headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  
  // Log all requests for debugging
  console.log(`🌐 Request: ${req.method} ${req.path} from origin: ${origin || 'No origin'} (${userAgent})`);
  
  // Set CORS headers for all responses
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log('✅ CORS: Set origin header for:', origin);
  } else if (!origin) {
    // Allow requests without origin (like server-to-server)
    res.header('Access-Control-Allow-Origin', '*');
    console.log('🔓 CORS: Set wildcard origin for no-origin request');
  }
  
  // Set comprehensive CORS headers
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Date, Server, X-Request-ID');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔄 Handling preflight request for origin:', origin);
    console.log('📋 Request headers:', req.headers);
    return res.status(200).end();
  }
  
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

// middleware لتطهير البيانات
app.use(mongoSanitize());
app.use(hpp());

// معدل الحد للطلبات
const rateLimit = require('express-rate-limit');
const limiter = rateLimit(config.rateLimit);
app.use('/api/', limiter);

// الاتصال بقاعدة البيانات
mongoose.connect(config.database.uri, config.database.options)
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

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
  const isAllowed = allowedOrigins.includes(requestOrigin);
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
      corsEnabled: true
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
    const isAllowed = allowedOrigins.includes(requestOrigin);
    
    const health = {
      status: 'OK',
      message: 'Server is running correctly',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.server.nodeEnv,
      version: require('./package.json').version,
      cors: {
        origin: requestOrigin,
        allowed: isAllowed,
        allowedOrigins: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']
      },
      database: {
        connected: mongoose.connection.readyState === 1,
        state: mongoose.connection.readyState
      }
    };
    
    console.log('🏥 Health check requested from origin:', requestOrigin);
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
  const isAllowed = allowedOrigins.includes(requestOrigin);
  
  res.json({ 
    message: 'CORS test successful',
    origin: requestOrigin,
    allowed: isAllowed,
    timestamp: new Date().toISOString(),
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

// معالج 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'الصفحة غير موجودة',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

const PORT = config.server.port || 10000;

// Start server with comprehensive logging
if (config.server.nodeEnv !== 'test') {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(80));
    console.log('🚀 BOOKING4U SERVER STARTED');
    console.log('='.repeat(80));
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌐 API available at http://0.0.0.0:${PORT}/api`);
    console.log(`🌍 Environment: ${config.server.nodeEnv}`);
    console.log(`📊 Health check: http://0.0.0.0:${PORT}/api/health`);
    console.log(`🔧 CORS test: http://0.0.0.0:${PORT}/api/test-cors`);
    console.log(`🐛 Debug endpoint: http://0.0.0.0:${PORT}/api/debug/cors`);
    console.log('');
    console.log('🔒 CORS Configuration:');
    console.log(`   ✅ Credentials: enabled`);
    console.log(`   ✅ Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD`);
    console.log(`   ✅ Max Age: 86400 seconds (24 hours)`);
    console.log(`   📋 Allowed Origins (${allowedOrigins.length}):`);
    allowedOrigins.forEach((origin, index) => {
      console.log(`      ${index + 1}. ${origin}`);
    });
    console.log('='.repeat(80));
  });

  // Graceful shutdown
  process.on('SIGTERM', gracefulShutdown(server));
  process.on('SIGINT', gracefulShutdown(server));
}

module.exports = app;