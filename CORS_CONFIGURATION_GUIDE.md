# CORS Configuration Guide for Booking4U

## Overview

This document provides a comprehensive guide to the CORS (Cross-Origin Resource Sharing) configuration implemented in the Booking4U application. The configuration has been designed to handle multiple deployment environments and provide robust cross-origin support.

## Backend CORS Configuration

### Server Configuration (`backend/server.js`)

The backend implements a comprehensive CORS setup with the following features:

#### Allowed Origins
```javascript
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
```

#### CORS Options
```javascript
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
```

### Middleware Stack

1. **Primary CORS Middleware**: Uses the `cors` package with comprehensive options
2. **Backup CORS Middleware**: Additional middleware for specific headers and logging
3. **Helmet Configuration**: Security headers compatible with CORS
4. **Preflight Handling**: Explicit OPTIONS request handling

### Debug Endpoints

#### `/api/debug/cors`
Provides detailed CORS information including:
- Request origin and headers
- CORS configuration status
- Server information
- Environment details

#### `/api/health`
Enhanced health check with CORS information:
- CORS status for the requesting origin
- Database connection status
- Server uptime and version

#### `/api/test-cors`
Simple CORS test endpoint for quick verification.

## Frontend CORS Configuration

### API Configuration (`frontend/src/config/apiConfig.js`)

#### Multiple Backend URLs
```javascript
const API_CONFIG = {
  // Primary backend URL - Render
  PRIMARY: 'https://booking4u-backend.onrender.com',
  
  // Alternative backend URLs
  ALTERNATIVE: 'https://booking4u-backend-1.onrender.com',
  BACKUP: 'https://booking4u-1.onrender.com',
  
  // GitHub Pages URL
  GITHUB_PAGES: 'https://booking4u-backend.onrender.com',
  
  // Development URLs
  DEVELOPMENT: 'http://localhost:10000',
  DEVELOPMENT_ALT: 'http://localhost:5001',
  
  // Local development with different ports
  LOCAL_3000: 'http://localhost:3000',
  LOCAL_5000: 'http://localhost:5000'
};
```

#### Smart URL Detection
The frontend automatically detects the environment and selects the appropriate API URL:
- Environment variables (highest priority)
- Development mode detection
- Hostname-based detection (GitHub Pages, Render, Netlify, Vercel)
- Fallback to primary URL

### Axios Configuration (`frontend/src/services/api.js`)

#### CORS-Enabled Axios Instance
```javascript
const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true, // Include credentials for CORS
  crossDomain: true,
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  }
});
```

#### Enhanced Request Interceptor
- Adds Origin and Referer headers
- Includes authentication tokens
- Comprehensive request logging
- CORS-specific debugging

#### Enhanced Response Interceptor
- CORS header logging
- CORS error detection and handling
- Automatic API connectivity testing on CORS errors
- Network error handling

## Deployment Configuration

### Render Configuration (`render.yaml`)

#### Frontend Environment Variables
```yaml
envVars:
  - key: REACT_APP_API_URL
    value: https://booking4u-backend.onrender.com/api
  - key: REACT_APP_BASE_URL
    value: https://booking4u-backend.onrender.com
  - key: REACT_APP_SOCKET_URL
    value: https://booking4u-backend.onrender.com
  - key: REACT_APP_FRONTEND_URL
    value: https://booking4u-1.onrender.com
  - key: REACT_APP_CORS_ENABLED
    value: true
  - key: REACT_APP_DEBUG_CORS
    value: true
```

#### Backend Environment Variables
```yaml
envVars:
  - key: CORS_ORIGIN
    value: https://booking4u-1.onrender.com,https://booking4u.onrender.com,https://booking4u-frontend.onrender.com,https://osamagivegh-hash.github.io
  - key: CORS_CREDENTIALS
    value: true
  - key: CORS_METHODS
    value: GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD
  - key: CORS_MAX_AGE
    value: 86400
```

## Testing CORS Configuration

### Comprehensive Test Script

Run the comprehensive CORS test:
```bash
node test-cors-comprehensive.js
```

This script tests:
- All backend URLs
- All frontend origins
- All API endpoints
- All HTTP methods
- Preflight requests
- CORS headers validation

### Manual Testing

#### Test CORS from Browser Console
```javascript
// Test basic CORS
fetch('https://booking4u-backend.onrender.com/api/health', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include'
})
.then(response => response.json())
.then(data => console.log('CORS Test:', data))
.catch(error => console.error('CORS Error:', error));

// Test preflight request
fetch('https://booking4u-backend.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include',
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password'
  })
})
.then(response => response.json())
.then(data => console.log('Preflight Test:', data))
.catch(error => console.error('Preflight Error:', error));
```

#### Test CORS Debug Endpoint
```bash
curl -H "Origin: https://booking4u-1.onrender.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -X OPTIONS \
     https://booking4u-backend.onrender.com/api/debug/cors
```

## Troubleshooting CORS Issues

### Common CORS Errors

1. **"Access to fetch at 'X' from origin 'Y' has been blocked by CORS policy"**
   - Check if the origin is in the allowed origins list
   - Verify the backend is running and accessible
   - Check browser console for detailed error messages

2. **"Response to preflight request doesn't pass access control check"**
   - Ensure OPTIONS requests are handled
   - Check CORS headers in preflight response
   - Verify allowed methods and headers

3. **"Credentials flag is true, but the 'Access-Control-Allow-Credentials' header is not set"**
   - Ensure `credentials: true` in CORS options
   - Check that `Access-Control-Allow-Credentials` header is set

### Debugging Steps

1. **Check Backend Logs**
   ```bash
   # View server logs for CORS information
   tail -f backend/logs/app.log
   ```

2. **Test API Endpoints**
   ```bash
   # Test health endpoint
   curl https://booking4u-backend.onrender.com/api/health
   
   # Test CORS debug endpoint
   curl https://booking4u-backend.onrender.com/api/debug/cors
   ```

3. **Browser Developer Tools**
   - Check Network tab for failed requests
   - Look for CORS-related error messages in Console
   - Verify request headers and response headers

4. **Frontend Debugging**
   ```javascript
   // Enable CORS debugging in frontend
   localStorage.setItem('debug-cors', 'true');
   
   // Test API connectivity
   import { testApiConnectivity, testCorsConnectivity } from './src/config/apiConfig';
   
   testApiConnectivity().then(result => console.log('API Test:', result));
   testCorsConnectivity().then(result => console.log('CORS Test:', result));
   ```

## Security Considerations

### CORS Security Best Practices

1. **Specific Origins**: Only allow specific origins, avoid wildcards in production
2. **Credentials**: Only enable credentials when necessary
3. **Headers**: Limit allowed headers to what's actually needed
4. **Methods**: Only allow necessary HTTP methods
5. **Max Age**: Set appropriate cache duration for preflight requests

### Current Security Configuration

- ✅ Specific allowed origins (no wildcards)
- ✅ Credentials enabled for authenticated requests
- ✅ Limited allowed headers
- ✅ Standard HTTP methods only
- ✅ 24-hour preflight cache
- ✅ Comprehensive logging for debugging

## Environment-Specific Configuration

### Development
- Localhost origins allowed
- Debug logging enabled
- Relaxed CORS for testing

### Production
- Specific production origins only
- Security headers enabled
- Optimized CORS configuration

### Staging
- Staging-specific origins
- Debug endpoints available
- Production-like security

## Monitoring and Maintenance

### Regular Checks
1. Monitor CORS error logs
2. Test CORS configuration after deployments
3. Update allowed origins when adding new domains
4. Review and update CORS policies periodically

### Logging
- All CORS requests are logged with origin information
- Failed CORS requests include detailed error information
- Debug endpoints provide real-time CORS status

## Conclusion

This comprehensive CORS configuration provides:
- ✅ Multi-environment support
- ✅ Robust error handling
- ✅ Comprehensive debugging tools
- ✅ Security best practices
- ✅ Easy maintenance and monitoring

The configuration is designed to handle the complexity of modern web applications while maintaining security and providing excellent developer experience.
