# CORS Fix Deployment Guide

## Overview
This guide provides the complete solution for fixing CORS errors in the Booking4U integrated Frontend + Backend project on Render.

## Issues Fixed

### 1. Backend CORS Configuration ✅
- **Problem**: CORS not properly configured for frontend domain
- **Solution**: Updated `backend/server.js` to allow `https://booking4u-integrated.onrender.com`
- **Files Modified**: `backend/server.js`

### 2. Unsafe Header Errors ✅
- **Problem**: Frontend manually setting `Origin` and `Referer` headers
- **Solution**: Removed manual header setting in `frontend/src/services/api.js`
- **Files Modified**: `frontend/src/services/api.js`

### 3. Health Check Route ✅
- **Problem**: No health check route at root path
- **Solution**: Added simple health check route at `/` in backend
- **Files Modified**: `backend/server.js`

### 4. API Base URL Configuration ✅
- **Problem**: Frontend using relative URLs for separate backend deployment
- **Solution**: Updated API config to use `https://booking4u-backend.onrender.com/api`
- **Files Modified**: `frontend/src/config/apiConfig.js`

## Files Modified

### Backend Changes

#### `backend/server.js`
```javascript
// Added health check route
app.get('/', (req, res) => {
  res.json({
    message: 'Booking4U Server is running',
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Updated CORS allowed origins
const allowedOrigins = [
  // ... existing origins ...
  'https://booking4u-integrated.onrender.com',
  'https://booking4u-backend.onrender.com'  // Added
];
```

### Frontend Changes

#### `frontend/src/services/api.js`
```javascript
// REMOVED: Manual header setting (causes "Refused to set unsafe header" errors)
// config.headers['Origin'] = window.location.origin;
// config.headers['Referer'] = window.location.href;

// REPLACED WITH: Comment explaining browser handles these automatically
// Note: Origin and Referer headers are automatically set by the browser
// and cannot be manually set due to security restrictions
```

#### `frontend/src/config/apiConfig.js`
```javascript
// Updated to use separate backend URL for Render deployment
if (window.location.hostname.includes('render.com')) {
  console.log('🔧 Render deployment detected - using separate backend URL');
  return `${API_CONFIG.PRIMARY}/api`;  // https://booking4u-backend.onrender.com/api
}
```

## Deployment Steps

### 1. Backend Deployment
```bash
# Navigate to backend directory
cd backend

# Install dependencies (if needed)
npm install

# Test locally (optional)
npm run dev

# Deploy to Render
# The backend will automatically deploy when you push to your repository
```

### 2. Frontend Deployment
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if needed)
npm install

# Build for production
npm run build

# Deploy to Render
# The frontend will automatically deploy when you push to your repository
```

## Testing the Fix

### 1. Health Check Test
```bash
curl https://booking4u-backend.onrender.com/
```
**Expected Response:**
```json
{
  "message": "Booking4U Server is running",
  "status": "OK",
  "timestamp": "2024-01-XX...",
  "environment": "production",
  "version": "1.0.0"
}
```

### 2. CORS Test
```bash
curl -H "Origin: https://booking4u-integrated.onrender.com" \
     https://booking4u-backend.onrender.com/api/test-cors
```
**Expected Response:**
```json
{
  "message": "CORS test successful",
  "origin": "https://booking4u-integrated.onrender.com",
  "allowed": true,
  "timestamp": "2024-01-XX...",
  "environment": {
    "isProduction": true,
    "isRender": true,
    "isLocalDevelopment": false
  }
}
```

### 3. Frontend API Test
Open browser console on `https://booking4u-integrated.onrender.com` and run:
```javascript
// Test API connectivity
fetch('/api/health')
  .then(response => response.json())
  .then(data => console.log('API Test:', data))
  .catch(error => console.error('API Error:', error));
```

## Expected Outcomes

### ✅ CORS Errors Resolved
- No more "Access to fetch at '...' from origin '...' has been blocked by CORS policy"
- No more "Refused to set unsafe header 'Origin'" errors
- No more "Refused to set unsafe header 'Referer'" errors

### ✅ API Requests Working
- Login requests succeed
- Data fetching works correctly
- Images and static assets load properly
- Authentication flows work end-to-end

### ✅ Health Check Passing
- Render health checks pass
- Backend responds at root path
- Server status monitoring works

## Troubleshooting

### If CORS errors persist:
1. Check browser console for specific error messages
2. Verify backend is deployed with latest changes
3. Test health check endpoint directly
4. Check Render deployment logs

### If API requests fail:
1. Verify frontend is using correct baseURL
2. Check network tab in browser dev tools
3. Ensure backend routes are properly configured
4. Test individual API endpoints with curl/Postman

### If health check fails:
1. Check Render deployment status
2. Verify environment variables are set
3. Check MongoDB connection
4. Review server logs in Render dashboard

## Package.json Scripts

### Backend (`backend/package.json`)
```json
{
  "scripts": {
    "start": "node server.js",  // ✅ Correct for production
    "dev": "nodemon server.js"  // ✅ Correct for development
  }
}
```

### Frontend (`frontend/package.json`)
```json
{
  "scripts": {
    "start": "react-scripts start",  // ✅ Correct for development
    "build": "react-scripts build"   // ✅ Correct for production
  }
}
```

## Environment Variables

### Backend (Render Environment Variables)
- `NODE_ENV=production`
- `MONGODB_URI=your_mongodb_connection_string`
- `PORT=10000` (automatically set by Render)

### Frontend (Render Environment Variables)
- `REACT_APP_API_URL=https://booking4u-backend.onrender.com/api` (optional)
- `NODE_ENV=production` (automatically set by Render)

## Summary

The CORS fix implementation includes:
1. ✅ Proper CORS configuration in backend
2. ✅ Removal of unsafe header modifications in frontend
3. ✅ Health check route for Render
4. ✅ Correct API baseURL configuration
5. ✅ Proper package.json scripts
6. ✅ Comprehensive testing and validation

After deploying these changes, your integrated Frontend + Backend project should work seamlessly on Render without CORS errors.
