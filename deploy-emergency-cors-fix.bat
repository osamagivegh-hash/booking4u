@echo off
REM Emergency CORS Fix Deployment Script
REM This script implements maximum aggression CORS solution

echo 🚨 Emergency CORS Fix Deployment
echo ==================================

REM Check if we're in the right directory
if not exist "backend\server.js" (
    echo ❌ Error: backend\server.js not found. Please run this script from the project root.
    pause
    exit /b 1
)

echo 📋 Checking Emergency CORS Configuration...

REM Check if emergency CORS fix is present
findstr /C:"EMERGENCY CORS SOLUTION" backend\server.js >nul
if %errorlevel% equ 0 (
    echo ✅ Emergency CORS solution is present
) else (
    echo ❌ Emergency CORS solution is missing
    pause
    exit /b 1
)

echo.
echo 🔧 Frontend Configuration Check...
findstr /C:"PRIMARY: 'https://booking4u-backend.onrender.com'" frontend\src\config\apiConfig.js >nul
if %errorlevel% equ 0 (
    echo ✅ Frontend configured with single backend URL
) else (
    echo ⚠️  Frontend configuration may need updating
)

echo.
echo 📦 Git Status:
git status --porcelain

echo.
echo 🔄 Committing Emergency CORS Fix...

REM Add all changes
git add backend\server.js
git add test-backend-service.js

REM Commit with comprehensive message
git commit -m "Implement EMERGENCY CORS solution - Maximum Aggression

- Allow ALL origins: origin: true (maximum permissiveness)
- Allow ALL headers: allowedHeaders: '*' 
- Allow ALL methods: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD, CONNECT, TRACE
- Quadruple CORS protection: Main CORS + Global OPTIONS + API-specific + Health-specific
- Force CORS headers on every request including health endpoint
- Extensive debugging logs for troubleshooting
- Maximum aggression approach to resolve persistent CORS errors

This emergency solution will work regardless of origin, headers, or method.
Designed to resolve the persistent CORS errors from booking4u-1.onrender.com."

echo ✅ Changes committed

echo.
echo 🚀 Pushing to GitHub...
git push origin main

echo ✅ Changes pushed to GitHub

echo.
echo 🚨 CRITICAL NEXT STEPS:
echo ========================
echo.
echo 1. 🚨 DEPLOY BACKEND SERVICES ON RENDER (MANDATORY):
echo    - Go to https://dashboard.render.com
echo    - Create Web Services for:
echo      * booking4u-backend (Primary)
echo      * booking4u-backend-1 (Backup)
echo      * booking4u-backend-2 (Backup)
echo      * booking4u-backend-3 (Backup)
echo.
echo 2. 🔧 SERVICE CONFIGURATION:
echo    Service Type: Web Service
echo    Environment: Node
echo    Build Command: cd backend && npm install
echo    Start Command: cd backend && npm start
echo    Root Directory: backend
echo.
echo 3. 🌍 ENVIRONMENT VARIABLES:
echo    NODE_ENV=production
echo    PORT=10000
echo    MONGODB_URI=mongodb+srv://osamagivegh:osamagivegh@cluster0.8qjqj.mongodb.net/booking4u?retryWrites=true&w=majority
echo    JWT_SECRET=your-super-secret-jwt-key-here
echo    JWT_EXPIRE=30d
echo    CORS_ORIGIN=https://booking4u-1.onrender.com
echo.
echo 4. 🧪 TESTING AFTER DEPLOYMENT:
echo    node test-backend-service.js
echo.
echo 5. 📱 FRONTEND ENVIRONMENT VARIABLES:
echo    REACT_APP_API_URL=https://booking4u-backend.onrender.com/api
echo    REACT_APP_BASE_URL=https://booking4u-backend.onrender.com
echo    REACT_APP_SOCKET_URL=https://booking4u-backend.onrender.com

echo.
echo 🎯 EXPECTED RESULTS:
echo ====================
echo ✅ All backend services return 200 status
echo ✅ CORS headers present on all responses
echo ✅ No CORS errors in browser console
echo ✅ Frontend successfully connects to backend
echo ✅ Authentication and API calls work

echo.
echo ⚠️  SECURITY NOTE:
echo ==================
echo This emergency CORS solution allows ALL origins and headers.
echo This is temporary for debugging. Once services are deployed:
echo 1. Restrict origins to specific domains
echo 2. Limit headers to required ones only
echo 3. Remove wildcard permissions

echo.
echo 📖 For detailed instructions, see: NUCLEAR_CORS_DEPLOYMENT.md
echo.
echo ✅ Emergency CORS Fix Deployment Complete!
pause

