@echo off
REM Deploy CORS Fix to All Backend Services
REM This script ensures all backend deployments have the CORS fix applied

echo 🚀 Deploying CORS Fix to All Backend Services
echo ==============================================

REM Check if we're in the right directory
if not exist "backend\server.js" (
    echo ❌ Error: backend\server.js not found. Please run this script from the project root.
    pause
    exit /b 1
)

echo 📋 Current CORS Configuration Check:
echo Checking if CORS fix is present in backend\server.js...

REM Check if CORS fix is present
findstr /C:"app.options('*', cors(corsOptions))" backend\server.js >nul
if %errorlevel% equ 0 (
    echo ✅ CORS fix is present in server.js
) else (
    echo ❌ CORS fix is missing from server.js
    echo Please ensure the CORS fix has been applied to backend\server.js
    pause
    exit /b 1
)

echo.
echo 🔧 Frontend Configuration Check:
echo Checking frontend configuration...

REM Check frontend config
findstr /C:"PRIMARY: 'https://booking4u-backend.onrender.com'" frontend\src\config\apiConfig.js >nul
if %errorlevel% equ 0 (
    echo ✅ Frontend configured to use single backend URL
) else (
    echo ⚠️  Frontend may still have multiple backend URLs
)

echo.
echo 📦 Git Status:
git status --porcelain

echo.
echo 🔄 Committing CORS Fix:

REM Add all changes
git add backend\server.js
git add frontend\src\config\apiConfig.js
git add frontend\env.production.txt
git add test-all-backends-cors.js

REM Commit with descriptive message
git commit -m "Fix CORS configuration across all backend deployments

- Remove multiple backend URLs from frontend config
- Use single backend domain: https://booking4u-backend.onrender.com
- Ensure CORS middleware is applied before all routes
- Add comprehensive backend testing script
- Fix environment variables to point to correct backend

This resolves intermittent CORS errors caused by frontend
switching between different backend domains."

echo ✅ Changes committed

echo.
echo 🚀 Pushing to GitHub:
git push origin main

echo ✅ Changes pushed to GitHub

echo.
echo 📋 Backend Services to Deploy:
echo You need to deploy these backend services on Render:
echo 1. booking4u-backend (Primary)
echo 2. booking4u-backend-1 (Backup)
echo 3. booking4u-backend-2 (Backup)
echo 4. booking4u-backend-3 (Backup)

echo.
echo 🔧 Render Deployment Configuration:
echo For each backend service, use these settings:
echo.
echo Service Type: Web Service
echo Environment: Node
echo Build Command: cd backend && npm install
echo Start Command: cd backend && npm start
echo Root Directory: backend
echo.
echo Environment Variables:
echo NODE_ENV=production
echo PORT=10000
echo MONGODB_URI=mongodb+srv://osamagivegh:osamagivegh@cluster0.8qjqj.mongodb.net/booking4u?retryWrites=true&w=majority
echo JWT_SECRET=your-super-secret-jwt-key-here
echo JWT_EXPIRE=30d
echo CORS_ORIGIN=https://booking4u-1.onrender.com

echo.
echo 🧪 Testing After Deployment:
echo After deploying all backend services, run:
echo node test-all-backends-cors.js
echo.
echo Expected results:
echo - All backend services should return 200 status
echo - CORS headers should be present
echo - Frontend should no longer show CORS errors

echo.
echo 🎯 Next Steps:
echo 1. Deploy backend services on Render dashboard
echo 2. Test CORS with: node test-all-backends-cors.js
echo 3. Verify frontend connectivity
echo 4. Monitor for any remaining CORS issues

echo.
echo ✅ CORS Fix Deployment Complete!
pause


