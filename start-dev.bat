@echo off
echo Starting Booking4U Development Environment...
echo.

echo Checking if MongoDB is running...
netstat -ano | findstr :27017 >nul
if %errorlevel% neq 0 (
    echo MongoDB is not running. Please start MongoDB first.
    pause
    exit /b 1
)

echo MongoDB is running.
echo.

echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm run dev"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend Server...
cd ..\frontend
start "Frontend Server" cmd /k "npm start"

echo.
echo Development servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:5000/api-docs
echo.
echo Press any key to exit this window...
pause >nul


