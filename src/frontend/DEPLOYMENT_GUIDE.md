# Frontend Deployment Guide

## Overview
This guide explains how to deploy the Booking4U frontend to work with the live backend server.

## Environment Configuration

### 1. Environment Variables
The frontend uses environment variables to configure API endpoints and other settings. Create a `.env.production` file in the frontend directory with the following content:

```bash
# API Configuration
REACT_APP_API_URL=https://booking4u-backend.onrender.com/api
REACT_APP_BASE_URL=https://booking4u-backend.onrender.com
REACT_APP_SOCKET_URL=https://booking4u-backend.onrender.com

# Environment
REACT_APP_NODE_ENV=production

# Feature Flags
REACT_APP_ENABLE_PAYMENTS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_ERROR_TRACKING=true

# App Configuration
REACT_APP_APP_NAME=Booking4U
REACT_APP_APP_VERSION=1.0.0
REACT_APP_DEFAULT_LANGUAGE=ar
REACT_APP_SUPPORTED_LANGUAGES=ar,en

# Production Settings
REACT_APP_DEBUG=false
REACT_APP_ENABLE_MOCK_DATA=false
REACT_APP_ENABLE_LOGGING=true
REACT_APP_ENABLE_HTTPS=true
REACT_APP_ENABLE_PWA=true
```

### 2. API Configuration
The frontend has been updated to use environment variables for API endpoints:

- **API Service** (`src/services/api.js`): Uses `REACT_APP_API_URL` or falls back to production URL
- **Socket Service** (`src/services/socket.js`): Uses `REACT_APP_SOCKET_URL` for WebSocket connections
- **Image Utils** (`src/utils/imageUtils.js`): Uses `REACT_APP_BASE_URL` for image URLs

## Build Process

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Build for Production
```bash
npm run build
```

This will create a `build` directory with optimized production files.

### 3. Serve the Build
```bash
npm run serve
```

Or use any static file server to serve the `build` directory.

## CORS Configuration

The backend server is configured to allow requests from:
- `http://localhost:3000` (development)
- `http://localhost:3001` (development)
- `http://127.0.0.1:3000` (development)
- `http://127.0.0.1:3001` (development)
- The value of `CORS_ORIGIN` environment variable

For production deployment, ensure your frontend domain is added to the backend's CORS configuration.

## Image and Asset Handling

### 1. Service Images
- Images are served from the backend at `/uploads/services/`
- The `imageUtils.js` handles URL construction for both local and production environments
- Fallback images are served from the frontend's public directory

### 2. Static Assets
- Default images (avatar, business logo, etc.) are served from the frontend
- Uploaded images are served from the backend
- All image URLs are properly constructed based on the environment

## Testing

### 1. Local Testing with Live Backend
To test the frontend locally against the live backend:

1. Create a `.env.local` file:
```bash
REACT_APP_API_URL=https://booking4u-backend.onrender.com/api
REACT_APP_BASE_URL=https://booking4u-backend.onrender.com
REACT_APP_SOCKET_URL=https://booking4u-backend.onrender.com
REACT_APP_NODE_ENV=production
```

2. Start the development server:
```bash
npm start
```

### 2. Production Testing
After deployment, test the following functionalities:

- [ ] User authentication (login/register)
- [ ] Service browsing and details
- [ ] Booking creation and management
- [ ] Real-time messaging
- [ ] Image loading and display
- [ ] Dashboard functionality
- [ ] Profile management

## Deployment Platforms

### 1. Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables in Netlify dashboard

### 2. Vercel
1. Connect your repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Add environment variables in Vercel dashboard

### 3. GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json scripts:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d build"
```
3. Deploy: `npm run deploy`

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your frontend domain is added to the backend's CORS configuration
   - Check that the backend is running and accessible

2. **Image Loading Issues**
   - Verify that `REACT_APP_BASE_URL` is set correctly
   - Check that the backend is serving images from `/uploads/`

3. **Socket Connection Issues**
   - Ensure `REACT_APP_SOCKET_URL` is set correctly
   - Check that the backend supports WebSocket connections

4. **Build Failures**
   - Check for any linting errors: `npm run lint`
   - Ensure all dependencies are installed: `npm install`

### Debug Mode
To enable debug logging, set `REACT_APP_DEBUG=true` in your environment variables.

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different API keys for development and production

2. **HTTPS**
   - Always use HTTPS in production
   - Set `REACT_APP_ENABLE_HTTPS=true` for production

3. **Content Security Policy**
   - The backend includes CSP headers for security
   - Ensure your frontend domain is allowed in the CSP configuration

## Performance Optimization

1. **Build Optimization**
   - The build process includes code splitting and minification
   - Use `npm run analyze` to analyze bundle size

2. **Image Optimization**
   - Images are served with proper caching headers
   - Consider using a CDN for better performance

3. **Caching**
   - Static assets are cached by the browser
   - API responses include appropriate cache headers

