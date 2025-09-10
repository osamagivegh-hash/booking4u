const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// NUCLEAR CORS FIX - Allow everything temporarily
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Manual CORS headers for every request
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    console.log('🚀 OPTIONS request handled');
    return res.status(200).end();
  }
  
  next();
});

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
