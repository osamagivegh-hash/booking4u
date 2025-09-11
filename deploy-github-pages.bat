@echo off
echo 🚀 Deploying Booking4U to GitHub Pages...

echo 📦 Building frontend...
cd frontend
call npm run build

if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo 📤 Deploying to GitHub Pages...
call npm run deploy:github

if %ERRORLEVEL% neq 0 (
    echo ❌ Deployment failed!
    pause
    exit /b 1
)

echo ✅ Successfully deployed to GitHub Pages!
echo 🌐 Your app is available at: https://osamagivegh-hash.github.io/booking4u
echo.
echo 📋 Next steps:
echo 1. Wait 5-10 minutes for GitHub Pages to update
echo 2. Check your app at: https://osamagivegh-hash.github.io/booking4u
echo 3. Verify CORS is working by checking browser console
echo.
pause
