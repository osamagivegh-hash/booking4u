@echo off
REM CORS Fix Deployment Script for Windows
REM This script helps deploy the CORS fixes to Render

echo 🚀 Deploying CORS fixes to Render...

REM Check if we're in the right directory
if not exist "server.js" (
    echo ❌ Error: server.js not found. Please run this script from the backend directory.
    exit /b 1
)

REM Check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: git is not installed or not in PATH
    exit /b 1
)

REM Add and commit the CORS changes
echo 📝 Adding CORS changes to git...
git add server.js test-cors.js deploy-cors-fix.bat

echo 💾 Committing CORS fixes...
git commit -m "Fix CORS configuration for production deployment

- Enhanced CORS debugging and logging
- Added fallback CORS headers for production
- Improved Socket.IO CORS configuration
- Added CORS test script for validation

Fixes: CORS policy blocking requests from https://booking4u-1.onrender.com"

REM Push to trigger Render deployment
echo 🚀 Pushing changes to trigger Render deployment...
git push origin main

echo ✅ CORS fixes deployed! Render should automatically redeploy the backend.
echo 🔍 Check the Render dashboard for deployment status.
echo 🧪 Run 'node test-cors.js' to test the CORS configuration after deployment.
