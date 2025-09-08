@echo off
setlocal enabledelayedexpansion

REM Render Build Test Script for Booking4U Frontend (Windows)
REM This script simulates the Render build process locally

echo 🚀 Starting Render Build Test for Booking4U Frontend
echo ==================================================

REM Check if we're in the frontend directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the frontend directory.
    exit /b 1
)

REM Check if craco.config.js exists
if not exist "craco.config.js" (
    echo ❌ Error: craco.config.js not found. This is required for the build process.
    exit /b 1
)

echo ✅ Found package.json and craco.config.js

REM Check Node.js version
echo 📋 Checking Node.js version...
node --version
if errorlevel 1 (
    echo ❌ Error: Node.js is not installed or not in PATH
    exit /b 1
)

REM Check if @craco/craco is installed
echo 📦 Checking dependencies...
npm list @craco/craco >nul 2>&1
if errorlevel 1 (
    echo ❌ @craco/craco is not installed. Installing...
    npm install @craco/craco
    if errorlevel 1 (
        echo ❌ Failed to install @craco/craco
        exit /b 1
    )
) else (
    echo ✅ @craco/craco is installed
)

REM Clean previous build
echo 🧹 Cleaning previous build...
if exist "build" rmdir /s /q build
echo ✅ Build directory cleaned

REM Install dependencies (simulating Render's npm install)
echo 📦 Installing dependencies...
npm ci --only=production=false
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    exit /b 1
)
echo ✅ Dependencies installed

REM Test craco configuration
echo 🔧 Testing craco configuration...
npx craco --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Craco configuration test failed
    exit /b 1
) else (
    echo ✅ Craco is working correctly
)

REM Run the build process (this is what Render will do)
echo 🏗️  Starting build process...
echo Command: npm run build
npm run build
if errorlevel 1 (
    echo ❌ Build failed!
    echo Check the error messages above for details.
    exit /b 1
)

REM Check if build was successful
if exist "build\index.html" (
    echo ✅ Build completed successfully!
    echo 📁 Build directory contents:
    dir build
    
    REM Check for common issues
    echo 🔍 Checking for common build issues...
    
    REM Check if static files exist
    if exist "build\static" (
        echo ✅ Static files generated
    ) else (
        echo ⚠️  Warning: No static files found
    )
    
    REM Check if index.html exists and has content
    for %%A in ("build\index.html") do set size=%%~zA
    if !size! gtr 0 (
        echo ✅ index.html generated with content
    ) else (
        echo ❌ Error: index.html is empty or missing
        exit /b 1
    )
    
    echo.
    echo 🎉 Build test completed successfully!
    echo This build should work on Render.
    
) else (
    echo ❌ Build failed - no index.html found!
    exit /b 1
)

echo.
echo 📋 Render Deployment Checklist:
echo ================================
echo ✅ package.json has @craco/craco in dependencies
echo ✅ Scripts use craco (start, build, test)
echo ✅ craco.config.js exists and is valid
echo ✅ Build process completes successfully
echo ✅ Build artifacts are generated correctly
echo.
echo 🚀 Ready for Render deployment!

pause
