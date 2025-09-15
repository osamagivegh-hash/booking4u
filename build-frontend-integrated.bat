@echo off
echo ========================================
echo Blueprint Integrated Frontend Build
echo ========================================

echo 1. Installing root dependencies...
call npm install

echo 2. Installing frontend dependencies...
cd frontend
call npm install

echo 3. Building frontend...
call npm run build

echo 4. Verifying frontend build...
if exist "build\index.html" (
    echo ✅ Frontend build created successfully
    echo 📁 Build contents:
    dir build
) else (
    echo ❌ Frontend build failed - index.html not found
    exit /b 1
)

echo 5. Installing backend dependencies...
cd ..\backend
call npm install

echo 6. Creating backend frontend-build directory...
if exist "frontend-build" rmdir /s /q frontend-build
mkdir frontend-build

echo 7. Copying frontend build to backend...
xcopy /E /I /Y ..\frontend\build\* frontend-build\

echo 8. Verifying copy...
if exist "frontend-build\index.html" (
    echo ✅ Frontend build copied successfully to backend
    echo 📁 Backend frontend-build contents:
    dir frontend-build
) else (
    echo ❌ Frontend build copy failed - index.html not found in backend
    exit /b 1
)

echo ========================================
echo Blueprint Integrated Build Complete!
echo ========================================
echo ✅ Frontend built and copied to backend/frontend-build/
echo ✅ Backend dependencies installed
echo ✅ Ready for deployment
