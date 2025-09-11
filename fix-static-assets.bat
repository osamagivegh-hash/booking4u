@echo off
echo 🔧 Fixing static assets for integrated deployment...

echo 📁 Creating frontend-build directory...
if not exist "backend\frontend-build" mkdir "backend\frontend-build"

echo 📦 Copying frontend build files...
xcopy "frontend\build\*" "backend\frontend-build\" /E /I /Y

echo ✅ Static assets fixed!
echo.
echo 📋 Files copied to backend\frontend-build:
dir "backend\frontend-build" /B

echo.
echo 🚀 You can now start the server with: npm start
pause

