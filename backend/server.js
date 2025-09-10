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

// CORS Configuration - الإعدادات المحسنة
console.log('🌍 Environment:', config.server.nodeEnv);

// القائمة الكاملة للنطاقات المسموحة
const allowedOrigins = [
  'https://booking4u-1.onrender.com',
  'https://booking4u.onrender.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

// إعدادات CORS مبسطة وفعالة
const corsOptions = {
  origin: function (origin, callback) {
    // السماح للطلبات بدون origin (مثل التطبيقات المحلية)
    if (!origin) return callback(null, true);
    
    // التحقق من النطاقات المسموحة
    const originAllowed = allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || 
      origin.startsWith(allowedOrigin.replace(/https?:\/\//, ''))
    );
    
    if (originAllowed) {
      callback(null, true);
    } else {
      console.log('❌ CORS: Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

// تطبيق middleware الـ CORS
app.use(cors(corsOptions));

// معالجة طلبات preflight بشكل صريح
app.options('*', cors(corsOptions));

// تكوين Helmet مع إعدادات آمنة
app.use(helmet({
  contentSecurityPolicy: false, // تعطيل مؤقت للتجربة
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
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

// نقطة نهاية جديدة للتشخيص
app.get('/api/debug/cors', (req, res) => {
  const requestOrigin = req.headers.origin;
  const isAllowed = allowedOrigins.includes(requestOrigin);
  
  res.json({
    origin: requestOrigin,
    allowed: isAllowed,
    allowedOrigins: allowedOrigins,
    timestamp: new Date().toISOString(),
    message: isAllowed ? 'Origin allowed' : 'Origin not allowed'
  });
});

// نقطة الصحة
app.get('/api/health', async (req, res) => {
  try {
    const health = {
      status: 'OK',
      message: 'الخادم يعمل بشكل صحيح',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.server.nodeEnv,
      version: require('./package.json').version,
      cors: {
        origin: req.headers.origin,
        allowed: allowedOrigins.includes(req.headers.origin),
        allowedOrigins: allowedOrigins
      }
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

// نقطة الاختبار
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    message: 'اختبار CORS ناجح',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
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

// بدء الخادم
if (config.server.nodeEnv !== 'test') {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 API available at http://0.0.0.0:${PORT}/api`);
    console.log(`🌍 Environment: ${config.server.nodeEnv}`);
    console.log(`📊 Health check: http://0.0.0.0:${PORT}/api/health`);
    console.log(`🔧 CORS enabled for origins: ${allowedOrigins.join(', ')}`);
    console.log(`🐛 Debug endpoint: http://0.0.0.0:${PORT}/api/debug/cors`);
  });

  // إيقاف أنيق
  process.on('SIGTERM', gracefulShutdown(server));
  process.on('SIGINT', gracefulShutdown(server));
}

module.exports = app;