@echo off
REM CORS Fix Deployment Script for Booking4U Backend
REM This script deploys the CORS configuration fix to Render

echo 🚀 Starting CORS Fix Deployment for Booking4U Backend
echo ==================================================

REM Check if we're in the right directory
if not exist "server.js" (
    echo ❌ Error: server.js not found. Please run this script from the backend directory.
    pause
    exit /b 1
)

REM Check if render.yaml exists
if not exist "render.yaml" (
    echo ❌ Error: render.yaml not found. Please ensure the file exists.
    pause
    exit /b 1
)

echo ✅ Found server.js and render.yaml

REM Verify CORS configuration in server.js
echo 🔍 Verifying CORS configuration...
findstr /C:"https://booking4u-1.onrender.com" server.js >nul
if %errorlevel% equ 0 (
    echo ✅ CORS configuration includes frontend URL
) else (
    echo ❌ CORS configuration missing frontend URL
    pause
    exit /b 1
)

REM Verify render.yaml has correct CORS_ORIGIN
echo 🔍 Verifying render.yaml CORS_ORIGIN...
findstr /C:"CORS_ORIGIN" render.yaml >nul
if %errorlevel% equ 0 (
    findstr /C:"https://booking4u-1.onrender.com" render.yaml >nul
    if %errorlevel% equ 0 (
        echo ✅ render.yaml has correct CORS_ORIGIN
    ) else (
        echo ❌ render.yaml missing or incorrect CORS_ORIGIN
        pause
        exit /b 1
    )
) else (
    echo ❌ render.yaml missing CORS_ORIGIN
    pause
    exit /b 1
)

echo.
echo 📋 CORS Fix Summary:
echo ===================
echo ✅ Added comprehensive CORS origin handling
echo ✅ Added all Render backend URLs to allowed origins
echo ✅ Enhanced CORS debugging and logging
echo ✅ Updated Socket.IO CORS configuration
echo ✅ Added fallback CORS headers middleware
echo ✅ Configured for production environment
echo.
echo 🌐 Frontend URL: https://booking4u-1.onrender.com
echo 🔧 Backend URLs:
echo    - https://booking4u-backend.onrender.com
echo    - https://booking4u-backend-1.onrender.com
echo    - https://booking4u-backend-2.onrender.com
echo    - https://booking4u-backend-3.onrender.com
echo.

REM Check if git is available
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 📝 Git status:
    git status --porcelain
    echo.
    
    REM Add and commit changes
    echo 📦 Committing CORS fix...
    git add server.js
    git commit -m "Fix CORS configuration for production deployment

- Add comprehensive CORS origin handling
- Include all Render backend URLs in allowed origins
- Enhance CORS debugging and logging
- Update Socket.IO CORS configuration
- Add fallback CORS headers middleware
- Configure for production environment

Fixes CORS errors from https://booking4u-1.onrender.com"
    
    if %errorlevel% equ 0 (
        echo ✅ CORS fix committed to git
        
        REM Push to main branch
        echo 🚀 Pushing to main branch...
        git push origin main
        
        if %errorlevel% equ 0 (
            echo ✅ Successfully pushed CORS fix to main branch
            echo.
            echo 🎉 CORS Fix Deployment Complete!
            echo ===============================
            echo The CORS configuration has been updated and pushed to the main branch.
            echo Render will automatically deploy the changes.
            echo.
            echo ⏳ Please wait 2-3 minutes for Render to deploy the changes.
            echo 🔍 You can monitor the deployment in your Render dashboard.
            echo.
            echo 🧪 Test the fix by visiting:
            echo    https://booking4u-1.onrender.com
            echo.
            echo 📊 Check backend health:
            echo    https://booking4u-backend.onrender.com/api/health
        ) else (
            echo ❌ Failed to push to main branch
            pause
            exit /b 1
        )
    ) else (
        echo ❌ Failed to commit changes
        pause
        exit /b 1
    )
) else (
    echo ⚠️  Git not available. Please manually commit and push the changes.
    echo    git add server.js
    echo    git commit -m "Fix CORS configuration for production deployment"
    echo    git push origin main
)

echo.
echo 🔧 Manual Deployment Steps (if needed):
echo ======================================
echo 1. Go to your Render dashboard
echo 2. Find the booking4u-backend service
echo 3. Click 'Manual Deploy' -^> 'Deploy latest commit'
echo 4. Wait for deployment to complete
echo 5. Test the frontend at https://booking4u-1.onrender.com
echo.
echo 📞 If issues persist, check Render logs for CORS debugging output.

pause