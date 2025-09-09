@echo off
REM Deploy CORS Fix to All Backend Instances
REM This script deploys the updated CORS configuration to all backend instances

echo 🚀 Deploying CORS Fix to All Backend Instances
echo ==============================================

REM Backend instances
set BACKENDS=booking4u-backend booking4u-backend-1 booking4u-backend-2 booking4u-backend-3

REM Check Render CLI authentication
echo 🔍 Checking Render CLI authentication...
render auth whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not authenticated with Render CLI
    echo Please run: render auth login
    exit /b 1
)

echo ✅ Authenticated with Render CLI

REM Deploy to each backend
set success_count=0
set total_count=0

for %%b in (%BACKENDS%) do (
    set /a total_count+=1
    echo.
    echo 📦 Deploying to: %%b
    
    REM Check if backend exists
    render services list | findstr "%%b" >nul 2>&1
    if %errorlevel% neq 0 (
        echo ⚠️  Backend %%b not found, skipping...
        goto :continue
    )
    
    REM Deploy the service
    echo 🔄 Deploying service...
    render services deploy %%b --wait
    if %errorlevel% equ 0 (
        echo ✅ Successfully deployed to %%b
        
        REM Wait a bit for the service to start
        echo ⏳ Waiting for service to start...
        timeout /t 30 /nobreak >nul
        
        REM Test the deployment
        echo 🧪 Testing deployment...
        curl -s -f "https://%%b.onrender.com/api/health" >nul 2>&1
        if %errorlevel% equ 0 (
            echo ✅ Health check passed for %%b
            set /a success_count+=1
        ) else (
            echo ❌ Health check failed for %%b
        )
    ) else (
        echo ❌ Failed to deploy to %%b
    )
    
    :continue
)

echo.
echo 📊 Deployment Summary
echo ==================
echo Total backends: %total_count%
echo Successful deployments: %success_count%
echo Failed deployments: %total_count%-%success_count%

if %success_count% equ %total_count% (
    echo.
    echo 🎉 All deployments successful!
    echo.
    echo 📋 Next Steps:
    echo 1. Run the CORS test script: node test-cors-fix.js
    echo 2. Test the frontend: https://booking4u-1.onrender.com
    echo 3. Check browser console for CORS errors
) else (
    echo.
    echo ⚠️  Some deployments failed. Check the logs above.
    exit /b 1
)

echo.
echo 🔧 CORS Configuration Applied:
echo • Allowed Origins: https://booking4u-1.onrender.com, http://localhost:3000
echo • Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
echo • Headers: Content-Type, Authorization, X-Requested-With
echo • Credentials: Enabled
echo • Preflight: Handled automatically

echo.
echo ✨ CORS fix deployment complete!
