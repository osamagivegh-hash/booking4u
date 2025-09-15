@echo off
echo ========================================
echo Blueprint Integrated Build Script
echo ========================================

echo 1. Installing dependencies...
call npm install

echo 2. Installing frontend dependencies...
cd frontend
call npm install

echo 3. Building frontend...
call npm run build

echo 4. Creating backend frontend-build directory...
cd ..\backend
if not exist "frontend-build" mkdir frontend-build

echo 5. Copying frontend build to backend...
xcopy /E /I /Y ..\frontend\build\* frontend-build\

echo 6. Verifying build...
if exist "frontend-build\index.html" (
    echo ✅ Frontend build copied successfully
    echo 📁 Build contents:
    dir frontend-build
) else (
    echo ❌ Frontend build failed - index.html not found
    exit /b 1
)

echo 7. Installing backend dependencies...
call npm install

echo ========================================
echo Blueprint Integrated Build Complete!
echo ========================================
echo ✅ Frontend built and copied to backend/frontend-build/
echo ✅ Backend dependencies installed
echo ✅ Ready for deployment
