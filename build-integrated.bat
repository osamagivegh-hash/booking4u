@echo off
echo 🚀 Building integrated Booking4U application...

echo Step 1: Installing backend dependencies...
cd backend
call npm install
cd ..

echo Step 2: Installing frontend dependencies...
cd frontend
call npm install

echo Step 3: Building React frontend...
call npm run build

echo Step 4: Copying build to backend directory...
REM Create the build directory in backend if it doesn't exist
if not exist "..\backend\frontend-build" mkdir "..\backend\frontend-build"

REM Copy the build files
xcopy /E /I /Y build\* ..\backend\frontend-build\

cd ..

echo ✅ Integrated build completed successfully!
echo 📁 Frontend build copied to: backend/frontend-build/
echo 🚀 Ready for deployment!
pause
