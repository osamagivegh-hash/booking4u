const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

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

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const isRender = process.env.RENDER === 'true';
const PORT = process.env.PORT || 10000;

console.log('🌍 Environment:', process.env.NODE_ENV);
console.log('🚀 Render deployment:', isRender);
console.log('📡 Port:', PORT);

// No CORS needed for Blueprint Integrated Deployment (same-origin)
// Frontend and backend are on the same domain, so no cross-origin issues

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
      imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
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

// Request logging middleware
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Data sanitization middleware
app.use(mongoSanitize());
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Database connection
console.log('🔄 Attempting to connect to MongoDB Atlas...');
console.log('📊 MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

// Validate and set MongoDB URI
let mongoUri = process.env.MONGODB_URI;

// Check if MONGODB_URI is valid
if (!mongoUri) {
  console.log('⚠️ MONGODB_URI environment variable not set, using fallback');
  mongoUri = 'mongodb+srv://osamagivegh:990099@cluster0.npzs81o.mongodb.net/booking4u?retryWrites=true&w=majority&appName=Cluster0';
} else if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
  console.log('❌ Invalid MONGODB_URI format, using fallback');
  console.log('🔍 Current MONGODB_URI:', mongoUri);
  mongoUri = 'mongodb+srv://osamagivegh:990099@cluster0.npzs81o.mongodb.net/booking4u?retryWrites=true&w=majority&appName=Cluster0';
}

console.log('🔗 Using MongoDB URI:', mongoUri.startsWith('mongodb+srv://') ? 'mongodb+srv://***' : 'mongodb://***');

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: true
})
.then(() => {
  console.log("✅ Connected to MongoDB Atlas");
  console.log('📊 Database name:', mongoose.connection.db.databaseName);
  console.log('🌐 Database host:', mongoose.connection.host);
  console.log('🔌 Database port:', mongoose.connection.port);
  console.log('🔗 Connection state:', mongoose.connection.readyState);
})
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
  console.error('🔍 Error details:', {
    name: err.name,
    code: err.code,
    message: err.message
  });
});

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

// Middleware to check database connection before processing requests
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.log('⚠️ Database not connected, readyState:', mongoose.connection.readyState);
    return res.status(503).json({
      success: false,
      message: 'Database connection not ready',
      error: 'Service temporarily unavailable',
      readyState: mongoose.connection.readyState
    });
  }
  next();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔌 MongoDB connection closed through app termination');
  process.exit(0);
});

// Health check route for Render Blueprint Integrated Deployment
app.get('/', (req, res) => {
  res.json({
    message: "Booking4U Backend is running",
    status: "OK",
    deployment: "Blueprint Integrated",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: "1.0.0",
    cors: "Same-origin (no CORS issues)"
  });
});

// API root route handler (moved to /api route)
app.get('/api', (req, res) => {
  res.json({
    message: 'Booking4U API Server',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    render: isRender,
    endpoints: {
      health: '/api/health',
      corsDebug: '/api/debug/cors',
      corsTest: '/api/test-cors',
      testSave: '/api/test-save',
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

// Test route to verify MongoDB Atlas data insertion
app.post('/api/test-save', async (req, res) => {
  try {
    console.log('🧪 Testing MongoDB Atlas data insertion...');
    
    // Create a test document
    const testData = {
      message: 'Test data from Booking4U',
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'development',
      randomId: Math.random().toString(36).substring(7)
    };
    
    // Insert into a test collection
    const TestModel = mongoose.model('TestData', new mongoose.Schema({
      message: String,
      timestamp: Date,
      environment: String,
      randomId: String
    }));
    
    const savedData = await TestModel.create(testData);
    
    console.log('✅ Test data saved successfully:', savedData);
    
    res.json({
      success: true,
      message: 'Test data saved to MongoDB Atlas successfully',
      data: savedData,
      database: {
        connected: mongoose.connection.readyState === 1,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.db.databaseName
      }
    });
    
  } catch (error) {
    console.error('❌ Test save failed:', error);
    res.status(500).json({
      success: false,
      message: 'Test save failed',
      error: error.message,
      database: {
        connected: mongoose.connection.readyState === 1,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.db?.databaseName || 'unknown'
      }
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/notifications', notificationRoutes);

// API health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    let dbConnected = false;
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db.admin().ping();
        dbConnected = true;
      }
    } catch (dbError) {
      console.error('❌ Database ping failed:', dbError.message);
    }
    
    res.json({
      status: dbConnected ? 'OK' : 'WARNING',
      message: dbConnected ? 'Server is running correctly' : 'Server running but database disconnected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      deployment: 'Blueprint Integrated',
      database: {
        connected: dbConnected,
        state: mongoose.connection.readyState
      }
    });
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

// Error handling middleware
app.use(errorLogger);
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(err.status || 500).json({ 
    error: 'حدث خطأ في الخادم',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// CRITICAL: Serve static files BEFORE catch-all route
// Serve uploads folder as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React frontend build folder as static files
const frontendBuildPath = path.join(__dirname, 'frontend-build');
const frontendBuildPathAlt = path.join(__dirname, '..', 'frontend', 'build');
console.log('📁 Frontend build path:', frontendBuildPath);
console.log('📁 Alternative frontend build path:', frontendBuildPathAlt);

// Check if frontend build exists in either location
let staticPath = null;
if (fs.existsSync(frontendBuildPath)) {
  console.log('✅ Frontend build folder found at:', frontendBuildPath);
  staticPath = frontendBuildPath;
} else if (fs.existsSync(frontendBuildPathAlt)) {
  console.log('✅ Frontend build folder found at alternative path:', frontendBuildPathAlt);
  staticPath = frontendBuildPathAlt;
} else {
  console.log('⚠️ Frontend build folder not found in either location');
  console.log('📂 Available directories in backend:', fs.readdirSync(__dirname));
  console.log('📂 Available directories in root:', fs.readdirSync(path.join(__dirname, '..')));
}

// Serve static files if build exists
if (staticPath) {
  app.use(express.static(staticPath));
  console.log('✅ Serving static files from:', staticPath);
}

// Catch-all handler for React Router (MUST be after all API routes and static files)
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api/')) {
    // Try both possible build paths
    const indexPath1 = path.join(frontendBuildPath, 'index.html');
    const indexPath2 = path.join(frontendBuildPathAlt, 'index.html');
    
    let indexPath = null;
    if (fs.existsSync(indexPath1)) {
      indexPath = indexPath1;
    } else if (fs.existsSync(indexPath2)) {
      indexPath = indexPath2;
    }
    
    if (indexPath) {
      console.log('🎯 Serving React app for route:', req.path, 'from:', indexPath);
      res.sendFile(indexPath);
    } else {
      console.log('❌ index.html not found in either location');
      console.log('   Tried:', indexPath1);
      console.log('   Tried:', indexPath2);
      res.status(404).json({
        error: 'Frontend not built',
        message: 'React build folder not found. Please run: npm run build',
        path: req.path,
        timestamp: new Date().toISOString(),
        buildPaths: {
          primary: frontendBuildPath,
          alternative: frontendBuildPathAlt
        }
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

// Start server with comprehensive logging
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(80));
    console.log('🚀 BOOKING4U BLUEPRINT INTEGRATED SERVER STARTED');
    console.log('='.repeat(80));
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌐 Frontend available at http://0.0.0.0:${PORT}/`);
    console.log(`🔧 API available at http://0.0.0.0:${PORT}/api`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🚀 Render Blueprint Integrated: ${isRender}`);
    console.log(`📊 Health check: http://0.0.0.0:${PORT}/`);
    console.log(`🔧 API health: http://0.0.0.0:${PORT}/api/health`);
    console.log('');
    console.log('🔒 CORS Configuration:');
    console.log(`   ✅ Same-origin requests: enabled (Blueprint Integrated)`);
    console.log(`   ✅ All origins allowed: enabled`);
    console.log(`   ✅ Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD`);
    console.log(`   ✅ Credentials: enabled`);
    console.log('');
    console.log('🎯 Blueprint Integrated Deployment:');
    console.log(`   ✅ Frontend served from: ${frontendBuildPath}`);
    console.log(`   ✅ React Router catch-all enabled`);
    console.log(`   ✅ Uploads served from: ${path.join(__dirname, 'uploads')}`);
    console.log(`   ✅ No CORS issues (same origin)`);
    console.log(`   ✅ Relative API paths: /api/*`);
    console.log('='.repeat(80));
  });

  // Graceful shutdown
  process.on('SIGTERM', gracefulShutdown(server));
  process.on('SIGINT', gracefulShutdown(server));
}

module.exports = app;