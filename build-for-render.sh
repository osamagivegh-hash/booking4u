#!/bin/bash

echo "=== BOOKING4U RENDER BUILD SCRIPT ==="
echo "Current directory: $(pwd)"
echo "Listing root contents:"
ls -la

echo "Checking for frontend directory:"
if [ -d "frontend" ]; then
    echo "✅ Frontend directory found"
    echo "Frontend contents:"
    ls -la frontend/
    
    echo "Checking public directory:"
    if [ -d "frontend/public" ]; then
        echo "✅ Public directory found"
        echo "Public contents:"
        ls -la frontend/public/
        
        echo "Checking for index.html:"
        if [ -f "frontend/public/index.html" ]; then
            echo "✅ index.html found in public directory"
        else
            echo "❌ index.html NOT found in public directory"
        fi
    else
        echo "❌ Public directory not found"
    fi
    
    echo "Changing to frontend directory..."
    cd frontend
    
    echo "Installing dependencies..."
    npm ci
    
    echo "Building application..."
    npm run build
    
    echo "Checking build output:"
    if [ -d "build" ]; then
        echo "✅ Build directory created"
        echo "Build contents:"
        ls -la build/
        
        if [ -f "build/index.html" ]; then
            echo "✅ index.html found in build directory"
            echo "First few lines of index.html:"
            head -5 build/index.html
        else
            echo "❌ index.html NOT found in build directory"
        fi
    else
        echo "❌ Build directory not created"
    fi
else
    echo "❌ Frontend directory not found"
    echo "Available directories:"
    ls -la
fi

echo "=== BUILD SCRIPT COMPLETE ==="
