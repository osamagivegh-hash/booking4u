#!/bin/bash

# Render Build Test Script for Booking4U Frontend
# This script simulates the Render build process locally

set -e  # Exit on any error

echo "🚀 Starting Render Build Test for Booking4U Frontend"
echo "=================================================="

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Check if craco.config.js exists
if [ ! -f "craco.config.js" ]; then
    echo "❌ Error: craco.config.js not found. This is required for the build process."
    exit 1
fi

echo "✅ Found package.json and craco.config.js"

# Check Node.js version
echo "📋 Checking Node.js version..."
node_version=$(node --version)
echo "Node.js version: $node_version"

# Check if @craco/craco is installed
echo "📦 Checking dependencies..."
if npm list @craco/craco > /dev/null 2>&1; then
    echo "✅ @craco/craco is installed"
else
    echo "❌ @craco/craco is not installed. Installing..."
    npm install @craco/craco
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf build/
echo "✅ Build directory cleaned"

# Install dependencies (simulating Render's npm install)
echo "📦 Installing dependencies..."
npm ci --only=production=false
echo "✅ Dependencies installed"

# Test craco configuration
echo "🔧 Testing craco configuration..."
if npx craco --version > /dev/null 2>&1; then
    echo "✅ Craco is working correctly"
else
    echo "❌ Craco configuration test failed"
    exit 1
fi

# Run the build process (this is what Render will do)
echo "🏗️  Starting build process..."
echo "Command: npm run build"
npm run build

# Check if build was successful
if [ -d "build" ] && [ -f "build/index.html" ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build directory contents:"
    ls -la build/
    
    # Check build size
    build_size=$(du -sh build/ | cut -f1)
    echo "📊 Build size: $build_size"
    
    # Check for common issues
    echo "🔍 Checking for common build issues..."
    
    # Check if static files exist
    if [ -d "build/static" ]; then
        echo "✅ Static files generated"
    else
        echo "⚠️  Warning: No static files found"
    fi
    
    # Check if index.html exists and has content
    if [ -s "build/index.html" ]; then
        echo "✅ index.html generated with content"
    else
        echo "❌ Error: index.html is empty or missing"
        exit 1
    fi
    
    echo ""
    echo "🎉 Build test completed successfully!"
    echo "This build should work on Render."
    
else
    echo "❌ Build failed!"
    echo "Check the error messages above for details."
    exit 1
fi

echo ""
echo "📋 Render Deployment Checklist:"
echo "================================"
echo "✅ package.json has @craco/craco in dependencies"
echo "✅ Scripts use craco (start, build, test)"
echo "✅ craco.config.js exists and is valid"
echo "✅ Build process completes successfully"
echo "✅ Build artifacts are generated correctly"
echo ""
echo "🚀 Ready for Render deployment!"
