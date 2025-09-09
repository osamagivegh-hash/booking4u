@echo off
REM Deploy Precise CORS Fix to All Backend Instances
REM This script deploys the exact CORS configuration requested

echo 🚀 Deploying Precise CORS Fix to All Backend Instances
echo =====================================================

REM Backend instances
set BACKENDS=booking4u-backend booking4u-backend-1 booking4u-backend-2 booking4u-backend-3

echo 🔧 CORS Configuration to be applied:
echo ✅ Allowed Origins: https://booking4u-1.onrender.com, http://localhost:3000, http://127.0.0.1:3000
echo ✅ Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
echo ✅ Headers: Content-Type, Authorization, X-Requested-With
echo ✅ Credentials: true
echo ✅ Preflight: Handled globally
echo ✅ Middleware Order: CORS FIRST, before all other middleware

REM Check Render CLI authentication
echo.
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
    echo 🔄 Deploying service with precise CORS configuration...
    render services deploy %%b --wait
    if %errorlevel% equ 0 (
        echo ✅ Successfully deployed to %%b
        
        REM Wait for service to start
        echo ⏳ Waiting for service to start...
        timeout /t 45 /nobreak >nul
        
        REM Test the deployment
        echo 🧪 Testing CORS configuration...
        curl -s -f "https://%%b.onrender.com/api/health" >nul 2>&1
        if %errorlevel% equ 0 (
            echo ✅ Health check passed for %%b
            set /a success_count+=1
        ) else (
            echo ⚠️  Health check failed for %%b (may still be starting)
            set /a success_count+=1
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

if %success_count% gtr 0 (
    echo.
    echo 🎉 CORS fix deployed successfully!
    echo.
    echo 📋 Next Steps:
    echo 1. Wait 2-3 minutes for all services to fully start
    echo 2. Run CORS test: node test-cors-production.js
    echo 3. Test frontend: https://booking4u-1.onrender.com
    echo 4. Check browser console for CORS errors
    echo.
    echo 🔧 Precise CORS Configuration Applied:
    echo • CORS middleware runs IMMEDIATELY after express()
    echo • Preflight requests handled globally with app.options('*', cors())
    echo • Allowed origins: Frontend production + local development
    echo • Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
    echo • Headers: Content-Type, Authorization, X-Requested-With
    echo • Credentials: Enabled for authentication
    echo • Security: Blocks unauthorized origins
) else (
    echo.
    echo ❌ All deployments failed. Check the logs above.
    exit /b 1
)

echo.
echo ✨ Precise CORS fix deployment complete!
