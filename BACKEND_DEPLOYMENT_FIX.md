# Backend Deployment Fix Guide

## Problem Analysis
The CORS errors are occurring because the backend services are returning 404 errors, meaning they are not running properly. All backend URLs tested are returning 404 status codes.

## Root Cause
The backend services on Render are not running or have failed to start properly. This could be due to:
1. Build failures
2. Start command issues
3. Environment variable problems
4. Missing dependencies

## Solution Steps

### Step 1: Check Render Dashboard
1. Go to your Render dashboard: https://dashboard.render.com
2. Find the `booking4u-backend` service
3. Check the deployment logs for any errors
4. Look for build or start failures

### Step 2: Manual Backend Deployment
If the service is not running, you can manually trigger a deployment:

1. **Option A: Force Redeploy**
   - Go to your backend service in Render dashboard
   - Click "Manual Deploy" → "Deploy latest commit"

2. **Option B: Update Environment Variables**
   - Go to Environment tab in your backend service
   - Ensure `CORS_ORIGIN` is set to: `https://booking4u-1.onrender.com`
   - Save changes (this will trigger a redeploy)

### Step 3: Verify Backend is Running
After deployment, test the backend:

```bash
# Test the health endpoint
curl https://booking4u-backend.onrender.com/api/health

# Should return JSON with status: "OK"
```

### Step 4: Alternative Backend URLs
If the main backend is not working, try these alternative URLs:
- `https://booking4u-backend-1.onrender.com`
- `https://booking4u-backend-2.onrender.com` 
- `https://booking4u-backend-3.onrender.com`

### Step 5: Update Frontend Configuration
If you find a working backend URL, update the frontend configuration:

1. **Update render.yaml** (for frontend service):
   ```yaml
   envVars:
     - key: REACT_APP_API_URL
       value: https://WORKING-BACKEND-URL.onrender.com/api
     - key: REACT_APP_BASE_URL
       value: https://WORKING-BACKEND-URL.onrender.com
     - key: REACT_APP_SOCKET_URL
       value: https://WORKING-BACKEND-URL.onrender.com
   ```

2. **Redeploy frontend** with the new configuration

## Quick Fix Commands

### Test Backend Connectivity
```bash
# Run the CORS test script
node test-cors.js

# Test specific backend
curl -I https://booking4u-backend.onrender.com/api/health
```

### Force Backend Redeploy
```bash
# Make a small change to trigger redeploy
echo "# Backend redeploy trigger" >> backend/README.md
git add backend/README.md
git commit -m "Trigger backend redeploy"
git push origin main
```

## Expected Results
After fixing the backend deployment:
- ✅ Backend health endpoint should return 200 status
- ✅ CORS headers should be present in responses
- ✅ Frontend should be able to communicate with backend
- ✅ No more CORS policy errors in browser console

## Troubleshooting
If backend still doesn't work:
1. Check Render service logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB connection string is valid
4. Check if the service is within Render's free tier limits

## Files Modified
- `frontend/src/config/apiConfig.js` - Enhanced error handling and CORS mode
- `test-cors.js` - Created for testing backend connectivity
