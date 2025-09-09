# CORS Fix Deployment Guide

## Problem
The frontend at `https://booking4u-1.onrender.com` was being blocked by CORS policy when trying to access the backend APIs. The backend's CORS_ORIGIN was set to an old Netlify URL instead of the current Render frontend URL.

## Changes Made

### 1. Backend CORS Configuration Fixed
- **File**: `backend/render.yaml`
- **Change**: Updated `CORS_ORIGIN` from `https://hilarious-sprinkles-a5a438.netlify.app` to `https://booking4u-1.onrender.com`

- **File**: `render.yaml` 
- **Change**: Added missing `CORS_ORIGIN` environment variable for the backend service

### 2. Frontend API Configuration Updated
- **File**: `frontend/src/config/apiConfig.js`
- **Change**: Removed `https://booking4u-1.onrender.com` from fallback URLs (since that's the frontend URL, not backend)

## Deployment Steps

### Option 1: Manual Deploy via Render Dashboard
1. Go to your Render dashboard
2. Find the `booking4u-backend` service
3. Go to Environment tab
4. Update the `CORS_ORIGIN` environment variable to: `https://booking4u-1.onrender.com`
5. Click "Save Changes"
6. The service will automatically redeploy

### Option 2: Deploy via Git (Recommended)
1. Commit the changes:
   ```bash
   git add backend/render.yaml render.yaml frontend/src/config/apiConfig.js
   git commit -m "Fix CORS configuration for Render deployment"
   git push origin main
   ```

2. Render will automatically detect the changes and redeploy

### Option 3: Force Redeploy
1. Go to your Render dashboard
2. Find the `booking4u-backend` service
3. Click "Manual Deploy" → "Deploy latest commit"

## Verification

After deployment, test the CORS fix:

1. Open browser developer tools
2. Go to `https://booking4u-1.onrender.com`
3. Check the Network tab for any CORS errors
4. The `/api/health` endpoint should now work without CORS errors

## Expected Result

The frontend should now be able to successfully communicate with the backend without CORS policy blocking the requests.

## Files Modified
- `backend/render.yaml` - Updated CORS_ORIGIN
- `render.yaml` - Added missing CORS_ORIGIN
- `frontend/src/config/apiConfig.js` - Fixed fallback URLs
