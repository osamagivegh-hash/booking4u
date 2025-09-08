#!/bin/bash

# Render Build Script for Booking4U Frontend
# This script ensures the correct working directory and build process

set -e

echo "🚀 Starting Render build process..."

# Ensure we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Current directory: $(pwd)"
    echo "📁 Directory contents:"
    ls -la
    exit 1
fi

# Check if public/index.html exists
if [ ! -f "public/index.html" ]; then
    echo "❌ Error: public/index.html not found"
    echo "📁 Public directory contents:"
    ls -la public/ || echo "Public directory does not exist"
    exit 1
fi

echo "✅ Found package.json and public/index.html"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run the build
echo "🏗️ Building application..."
npm run build

# Verify build output
if [ -f "build/index.html" ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build directory contents:"
    ls -la build/
else
    echo "❌ Build failed - no build/index.html found"
    exit 1
fi

echo "🎉 Render build process completed!"