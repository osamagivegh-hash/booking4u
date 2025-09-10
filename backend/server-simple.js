const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// CORS configuration for production
const allowedOrigins = [
  'https://booking4u-1.onrender.com',
  'https://booking4u.onrender.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS: Allowed origin:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS: Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Simple health endpoint
app.get('/api/health', (req, res) => {
  console.log('🚀 Health endpoint called from:', req.headers.origin);
  res.json({
    status: 'OK',
    message: 'Server is running with CORS fix',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('🚀 Test endpoint called from:', req.headers.origin);
  res.json({
    message: 'CORS test successful',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Booking4U API with CORS fix',
    status: 'Running',
    cors: 'Enabled'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 CORS enabled for all origins`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
