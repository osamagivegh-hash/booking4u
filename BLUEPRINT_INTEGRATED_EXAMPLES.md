# Blueprint Integrated Deployment - Working Examples

## Overview
This document provides working examples and testing instructions for the Blueprint Integrated Deployment fix.

## ✅ Backend Configuration (server.js)

### Health Check Endpoint
```javascript
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
```

### API Health Endpoint
```javascript
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
```

### Server Configuration
```javascript
// No CORS needed for Blueprint Integrated Deployment (same-origin)
// Frontend and backend are on the same domain, so no cross-origin issues

// Server listens on process.env.PORT and "0.0.0.0"
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 BOOKING4U BLUEPRINT INTEGRATED SERVER STARTED');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Frontend available at http://0.0.0.0:${PORT}/`);
  console.log(`🔧 API available at http://0.0.0.0:${PORT}/api`);
});
```

## ✅ Frontend Configuration (Axios)

### API Service Configuration
```javascript
import axios from 'axios';

// Create axios instance for Blueprint Integrated Deployment
// Uses relative paths for same-origin requests (no CORS issues)
const api = axios.create({
  baseURL: '/api', // Relative path for same-origin requests
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true, // Include credentials for authentication
  validateStatus: function (status) {
    return status >= 200 && status < 300; // default
  }
});

export default api;
```

### Request Interceptor
```javascript
// Request interceptor for Blueprint Integrated Deployment
api.interceptors.request.use(
  (config) => {
    // Fix for image uploads: Don't override Content-Type for multipart/form-data
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      delete config.headers['Content-Type'];
    }
    
    console.log('🔍 API REQUEST:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      fullUrl: `${config.baseURL}${config.url}`,
      timestamp: new Date().toISOString()
    });
    
    // Add authentication token if available
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 Token added to request');
        }
      }
    } catch (error) {
      console.log('❌ Error parsing auth storage:', error.message);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);
```

## ✅ Working API Request Examples

### 1. Health Check Request
```javascript
// Frontend health check request
fetch('/api/health')
  .then(response => response.json())
  .then(data => {
    console.log('Health check response:', data);
    // Expected response:
    // {
    //   status: "OK",
    //   message: "Server is running correctly",
    //   deployment: "Blueprint Integrated",
    //   database: { connected: true, state: 1 }
    // }
  })
  .catch(error => {
    console.error('Health check error:', error);
  });
```

### 2. Login Request
```javascript
// Login request using the api instance
import api from '../services/api';

const loginData = {
  email: 'user@example.com',
  password: 'password123'
};

api.post('/auth/login', loginData)
  .then(response => {
    console.log('Login successful:', response.data);
    // Handle successful login
  })
  .catch(error => {
    console.error('Login error:', error);
    // Handle login error
  });
```

### 3. Fetch Businesses
```javascript
// Fetch businesses using the api instance
import api from '../services/api';

api.get('/businesses')
  .then(response => {
    console.log('Businesses loaded:', response.data);
    // Update UI with businesses
  })
  .catch(error => {
    console.error('Error loading businesses:', error);
  });
```

### 4. Upload Image
```javascript
// Upload image using FormData
import api from '../services/api';

const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('serviceId', serviceId);

api.post('/services/upload-image', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
.then(response => {
  console.log('Image uploaded:', response.data);
})
.catch(error => {
  console.error('Upload error:', error);
});
```

## ✅ Testing Instructions

### 1. Backend Health Check
```bash
# Test root health check
curl https://your-domain.onrender.com/

# Expected response:
{
  "message": "Booking4U Backend is running",
  "status": "OK",
  "deployment": "Blueprint Integrated",
  "timestamp": "2024-01-XX...",
  "environment": "production",
  "version": "1.0.0",
  "cors": "Same-origin (no CORS issues)"
}
```

### 2. API Health Check
```bash
# Test API health check
curl https://your-domain.onrender.com/api/health

# Expected response:
{
  "status": "OK",
  "message": "Server is running correctly",
  "timestamp": "2024-01-XX...",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0",
  "deployment": "Blueprint Integrated",
  "database": {
    "connected": true,
    "state": 1
  }
}
```

### 3. Frontend API Test
```javascript
// Test in browser console on your Blueprint Integrated domain
fetch('/api/health')
  .then(response => response.json())
  .then(data => console.log('API Test Success:', data))
  .catch(error => console.error('API Test Error:', error));
```

### 4. Login Test
```javascript
// Test login in browser console
fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
})
.then(response => response.json())
.then(data => console.log('Login Test:', data))
.catch(error => console.error('Login Error:', error));
```

## ✅ Expected Results

### No More Errors
- ❌ "Access to XMLHttpRequest at 'https://booking4u-backend.onrender.com/api/...' from origin 'https://booking4u-integrated.onrender.com' has been blocked by CORS policy"
- ❌ "Refused to set unsafe header 'Origin'"
- ❌ "Refused to set unsafe header 'Referer'"
- ❌ Network errors (net::ERR_FAILED)

### Working Features
- ✅ Health check at `/` returns proper JSON
- ✅ API health check at `/api/health` works
- ✅ Login requests succeed
- ✅ Business data loads correctly
- ✅ Images upload and display properly
- ✅ All CRUD operations work
- ✅ Authentication flows work end-to-end

## ✅ Package.json Configuration

### Backend package.json
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Root package.json
```json
{
  "scripts": {
    "build:blueprint": "cd frontend && npm install && npm run build && cd ../backend && mkdir -p frontend-build && cp -r ../frontend/build/* frontend-build/ && npm install",
    "start": "cd backend && npm start"
  }
}
```

## ✅ Deployment Commands

### Deploy the Fix
```bash
# Use the deployment script
BLUEPRINT_INTEGRATED_FINAL_FIX.bat

# Or manually
git add .
git commit -m "FINAL FIX: Blueprint Integrated - remove CORS, use relative API paths, clean configuration"
git push origin main
```

### Build Locally (for testing)
```bash
# Build the project
npm run build:blueprint

# Start the server
npm start
```

## 🎉 Summary

The Blueprint Integrated Deployment is now configured for:
- **Same-origin requests** (no CORS issues)
- **Relative API paths** (`/api/*`)
- **Clean configuration** (no unnecessary CORS setup)
- **Proper health checks** (both `/` and `/api/health`)
- **Working authentication** (with credentials)
- **Image uploads** (with proper FormData handling)

All frontend requests now use relative paths, eliminating CORS errors and network failures!
