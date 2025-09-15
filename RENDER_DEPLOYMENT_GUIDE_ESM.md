# Render Deployment Guide - Express + React with ES Modules

## Overview
This guide explains how to deploy your Express + React application on Render with ES Modules support, serving the React build folder and handling React Router properly.

## 1. Server Configuration

### Key Features of the ES Modules Server:
- ✅ **Serves React build folder** (`frontend-build`) as static files
- ✅ **React Router support** with catch-all route to `index.html`
- ✅ **Serves uploads folder** as static files at `/uploads`
- ✅ **ES Modules syntax** (import/export instead of require)
- ✅ **CORS configuration** for integrated deployment
- ✅ **Health check endpoints** for monitoring

### File Structure for Render Deployment:
```
backend/
├── server-esm.js          # Main server file (ES Modules)
├── package-esm.json       # Package.json with "type": "module"
├── frontend-build/        # React build folder (place here)
│   ├── index.html
│   ├── static/
│   └── ...
├── uploads/               # Uploaded files
│   ├── services/
│   └── news/
└── ... (other backend files)
```

## 2. React Build Folder Placement

### For Render Deployment:
1. **Build your React app:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Copy the build folder to backend:**
   ```bash
   # From project root
   cp -r frontend/build backend/frontend-build
   ```

3. **Verify the structure:**
   ```
   backend/frontend-build/
   ├── index.html
   ├── static/
   │   ├── css/
   │   └── js/
   ├── manifest.json
   └── ...
   ```

## 3. Render Configuration

### Render.yaml Configuration:
```yaml
services:
  - type: web
    name: booking4u-integrated
    env: node
    plan: free
    buildCommand: |
      cd backend
      npm install
      # React build should already be in frontend-build folder
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        fromDatabase:
          name: booking4u-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: PORT
        value: 10000
```

### Environment Variables:
- `NODE_ENV=production`
- `MONGODB_URI=your_mongodb_connection_string`
- `JWT_SECRET=your_jwt_secret`
- `PORT=10000`

## 4. Server.js Key Features

### Static File Serving:
```javascript
// Serve uploads folder as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React frontend build folder as static files
const frontendBuildPath = path.join(__dirname, 'frontend-build');
app.use(express.static(frontendBuildPath));
```

### React Router Support:
```javascript
// Catch-all handler for React Router (must be after all API routes)
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api/')) {
    const indexPath = path.join(frontendBuildPath, 'index.html');
    res.sendFile(indexPath);
  } else {
    // API routes that don't exist should return 404
    res.status(404).json({ 
      error: 'API endpoint not found',
      path: req.originalUrl,
      timestamp: new Date().toISOString()
    });
  }
});
```

### ES Modules Support:
```javascript
// ES Modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import statements instead of require
import express from 'express';
import mongoose from 'mongoose';
// ... other imports
```

## 5. Deployment Steps

### Step 1: Prepare Backend
1. **Replace package.json:**
   ```bash
   cd backend
   mv package.json package-old.json
   mv package-esm.json package.json
   ```

2. **Replace server.js:**
   ```bash
   mv server.js server-old.js
   mv server-esm.js server.js
   ```

### Step 2: Build and Copy React App
```bash
# Build React app
cd frontend
npm run build

# Copy build to backend
cd ..
cp -r frontend/build backend/frontend-build
```

### Step 3: Deploy to Render
1. **Push to Git:**
   ```bash
   git add .
   git commit -m "Deploy Express + React with ES Modules"
   git push origin main
   ```

2. **Deploy on Render:**
   - Connect your GitHub repository
   - Use the render.yaml configuration
   - Set environment variables
   - Deploy

## 6. Verification

### After Deployment, Test:
1. **Frontend:** `https://your-app.onrender.com/`
2. **API Health:** `https://your-app.onrender.com/api/health`
3. **React Router:** `https://your-app.onrender.com/dashboard`
4. **Uploads:** `https://your-app.onrender.com/uploads/services/filename.webp`

### Expected Results:
- ✅ React app loads correctly
- ✅ React Router works (no 404 on refresh)
- ✅ API endpoints respond
- ✅ Static files (uploads) are accessible
- ✅ No CORS issues (same origin)

## 7. Troubleshooting

### Common Issues:

#### 1. React Router 404 Errors:
- **Cause:** Catch-all route not working
- **Fix:** Ensure the catch-all route is after all API routes

#### 2. Static Files Not Loading:
- **Cause:** Incorrect path to frontend-build
- **Fix:** Verify `frontend-build` folder exists in backend

#### 3. ES Modules Import Errors:
- **Cause:** Missing `"type": "module"` in package.json
- **Fix:** Ensure package.json has `"type": "module"`

#### 4. CORS Issues:
- **Cause:** CORS configuration not allowing same origin
- **Fix:** CORS is configured for integrated deployment

## 8. File Structure Summary

```
booking4u/
├── frontend/                 # React app source
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/                  # Express server
│   ├── server.js            # ES Modules server
│   ├── package.json         # With "type": "module"
│   ├── frontend-build/      # React build (copied here)
│   │   ├── index.html
│   │   └── static/
│   ├── uploads/             # Static file uploads
│   └── ... (other files)
└── render.yaml              # Render configuration
```

## 9. Benefits of This Setup

- ✅ **Single deployment** - Frontend and backend together
- ✅ **No CORS issues** - Same origin requests
- ✅ **React Router support** - Proper SPA routing
- ✅ **Static file serving** - Uploads and assets
- ✅ **ES Modules** - Modern JavaScript syntax
- ✅ **Production ready** - Optimized for Render

This configuration provides a complete, production-ready deployment of your Express + React application on Render with proper ES Modules support and React Router handling.
