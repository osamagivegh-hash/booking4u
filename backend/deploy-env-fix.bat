@echo off
REM Environment Configuration Fix Deployment Script for Windows
REM This script deploys the corrected environment configuration to Render

echo 🚀 Deploying corrected environment configuration to Render...

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

echo 📝 Adding environment configuration changes to git...
git add env.production.example render.yaml env.production.corrected deploy-env-fix.bat

echo 💾 Committing environment configuration fixes...
git commit -m "Fix backend environment configuration for production

- Fixed MongoDB URI format in env.production.example
- Updated render.yaml with correct CORS_ORIGIN (https://booking4u-1.onrender.com)
- Optimized database connection settings for production
- Added comprehensive environment variables to render.yaml
- Created corrected production environment template

Fixes: CORS errors blocking frontend requests from live site"

echo 🚀 Pushing changes to trigger Render deployment...
git push origin main

echo ✅ Environment configuration fixes deployed!
echo 🔍 Check the Render dashboard for deployment status.
echo 📋 Key fixes applied:
echo    - CORS_ORIGIN: https://booking4u-1.onrender.com
echo    - MongoDB URI: Corrected format
echo    - Database settings: Optimized for production
echo    - JWT expire: Set to 24h for production
echo    - Log level: Set to warn for production
echo.
echo 🧪 After deployment, test the frontend at: https://booking4u-1.onrender.com
echo 📊 Monitor backend logs in Render dashboard for CORS debugging info.
