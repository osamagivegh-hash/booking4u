#!/bin/bash

# Frontend build script for Render
echo "🚀 Building frontend for production..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Install serve for production
echo "📦 Installing serve..."
npm install -g serve

echo "✅ Build complete!"
echo "🚀 Starting production server..."

# Start the production server
serve -s build -l 3000
