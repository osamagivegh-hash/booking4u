#!/bin/bash

# Build script for Render deployment
echo "🚀 Starting build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies (optional for backend deployment)
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Build completed successfully!"
