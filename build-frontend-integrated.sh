#!/bin/bash

echo "========================================"
echo "Blueprint Integrated Frontend Build"
echo "========================================"

# Set error handling
set -e

echo "1. Installing root dependencies..."
npm install

echo "2. Installing frontend dependencies..."
cd frontend
npm install

echo "3. Building frontend..."
npm run build

echo "4. Verifying frontend build..."
if [ -f "build/index.html" ]; then
    echo "✅ Frontend build created successfully"
    echo "📁 Build contents:"
    ls -la build/
else
    echo "❌ Frontend build failed - index.html not found"
    exit 1
fi

echo "5. Installing backend dependencies..."
cd ../backend
npm install

echo "6. Creating backend frontend-build directory..."
rm -rf frontend-build
mkdir -p frontend-build

echo "7. Copying frontend build to backend..."
cp -r ../frontend/build/* frontend-build/

echo "8. Verifying copy..."
if [ -f "frontend-build/index.html" ]; then
    echo "✅ Frontend build copied successfully to backend"
    echo "📁 Backend frontend-build contents:"
    ls -la frontend-build/
else
    echo "❌ Frontend build copy failed - index.html not found in backend"
    exit 1
fi

echo "========================================"
echo "Blueprint Integrated Build Complete!"
echo "========================================"
echo "✅ Frontend built and copied to backend/frontend-build/"
echo "✅ Backend dependencies installed"
echo "✅ Ready for deployment"
