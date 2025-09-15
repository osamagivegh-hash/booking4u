#!/bin/bash

echo "========================================"
echo "Blueprint Integrated Build Script"
echo "========================================"

# Set error handling
set -e

echo "1. Installing dependencies..."
npm install

echo "2. Installing frontend dependencies..."
cd frontend
npm install

echo "3. Building frontend..."
npm run build

echo "4. Creating backend frontend-build directory..."
cd ../backend
mkdir -p frontend-build

echo "5. Copying frontend build to backend..."
cp -r ../frontend/build/* frontend-build/

echo "6. Verifying build..."
if [ -f "frontend-build/index.html" ]; then
    echo "✅ Frontend build copied successfully"
    echo "📁 Build contents:"
    ls -la frontend-build/
else
    echo "❌ Frontend build failed - index.html not found"
    exit 1
fi

echo "7. Installing backend dependencies..."
npm install

echo "========================================"
echo "Blueprint Integrated Build Complete!"
echo "========================================"
echo "✅ Frontend built and copied to backend/frontend-build/"
echo "✅ Backend dependencies installed"
echo "✅ Ready for deployment"
