# Render Deployment Configuration for Booking4U Frontend

## Overview
This document provides specific configuration guidance for deploying the Booking4U React frontend to Render with Craco configuration.

## Current Configuration Status ✅

### Package.json Configuration
- ✅ `@craco/craco` is in dependencies (not devDependencies)
- ✅ Scripts are correctly configured:
  - `start`: `craco start`
  - `build`: `craco build`
  - `test`: `craco test`
  - `eject`: `react-scripts eject`

### Craco Configuration
- ✅ `craco.config.js` exists in project root
- ✅ Valid webpack configuration for production optimization
- ✅ Development server configuration

## Render Dashboard Configuration

### Build Settings
1. **Build Command**: `npm run build`
2. **Publish Directory**: `build`
3. **Node Version**: `18.x` (as specified in package.json engines)

### Environment Variables
Set these in your Render dashboard:

```
NODE_ENV=production
REACT_APP_API_URL=https://your-backend-url.onrender.com
REACT_APP_SOCKET_URL=https://your-backend-url.onrender.com
```

### Advanced Build Settings (if needed)
If you encounter build issues, you can override the build command in Render:

**Alternative Build Command**: `npm ci && npm run build`

## Build Process Validation

### Local Testing
Before deploying to Render, test the build process locally:

**Windows:**
```bash
cd frontend
render-build-test.bat
```

**Linux/Mac:**
```bash
cd frontend
chmod +x render-build-test.sh
./render-build-test.sh
```

### Expected Build Output
The build should generate:
- `build/index.html` - Main HTML file
- `build/static/css/` - CSS files
- `build/static/js/` - JavaScript bundles
- `build/static/media/` - Static assets

## Troubleshooting Common Issues

### Issue 1: Craco Not Found
**Error**: `'craco' is not recognized as an internal or external command`

**Solution**: Ensure `@craco/craco` is in dependencies, not devDependencies:
```json
{
  "dependencies": {
    "@craco/craco": "^7.1.0"
  }
}
```

### Issue 2: Build Fails with Webpack Errors
**Error**: Webpack configuration conflicts

**Solution**: The current `craco.config.js` includes webpack optimizations. If issues persist, try a minimal config:

```javascript
module.exports = {
  // Minimal configuration for Render
};
```

### Issue 3: Memory Issues During Build
**Error**: JavaScript heap out of memory

**Solution**: Add to Render build command:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Issue 4: Static File Serving Issues
**Error**: 404 for static assets

**Solution**: Ensure `homepage` field in package.json (if using custom domain):
```json
{
  "homepage": "https://your-app-name.onrender.com"
}
```

## Render Service Configuration

### Static Site Configuration
1. **Service Type**: Static Site
2. **Build Command**: `npm run build`
3. **Publish Directory**: `build`
4. **Node Version**: 18.x

### Web Service Configuration (if using SSR)
1. **Service Type**: Web Service
2. **Build Command**: `npm run build`
3. **Start Command**: `npm start`
4. **Publish Directory**: `build`

## Performance Optimizations

### Current Craco Configuration Benefits
- ✅ Tree shaking enabled for production
- ✅ Code splitting for better caching
- ✅ Vendor chunk separation
- ✅ Common chunk optimization

### Additional Render Optimizations
1. **Enable Gzip Compression**: Automatic in Render
2. **CDN**: Automatic through Render's CDN
3. **Caching**: Configured in `_headers` file

## Deployment Checklist

Before deploying to Render:

- [ ] Run local build test (`render-build-test.bat` or `render-build-test.sh`)
- [ ] Verify all dependencies are in `dependencies` (not `devDependencies`)
- [ ] Check that scripts use `craco` commands
- [ ] Ensure `craco.config.js` exists and is valid
- [ ] Test build produces `build/index.html`
- [ ] Verify static assets are generated
- [ ] Set environment variables in Render dashboard
- [ ] Configure build command as `npm run build`
- [ ] Set publish directory as `build`

## Support Files Created

1. **`render-build-test.sh`** - Linux/Mac build validation script
2. **`render-build-test.bat`** - Windows build validation script
3. **`RENDER_DEPLOYMENT_CONFIG.md`** - This configuration guide

## Next Steps

1. Run the build test script locally
2. Deploy to Render using the configuration above
3. Monitor build logs for any issues
4. Test the deployed application

## Contact

If you encounter issues not covered in this guide, check:
1. Render build logs for specific error messages
2. Local build test results
3. Craco documentation: https://craco.js.org/
4. Render documentation: https://render.com/docs
