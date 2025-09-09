@echo off
echo Testing frontend build...
cd frontend
echo Current directory: %CD%
echo Listing contents:
dir
echo Installing dependencies...
npm install
echo Building application...
npm run build
echo Build completed. Checking build directory:
dir build
echo Checking for index.html:
if exist "build\index.html" (
    echo SUCCESS: index.html found in build directory
) else (
    echo ERROR: index.html NOT found in build directory
)
pause

