#!/bin/bash

# Deployment script for Render
echo "🚀 Starting deployment process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Create logs directory if it doesn't exist
mkdir -p logs

# Set production environment variables
export NODE_ENV=production
export PORT=${PORT:-10000}

echo "✅ Deployment setup complete!"
echo "🌍 Environment: $NODE_ENV"
echo "🔌 Port: $PORT"

# Start the application
echo "🚀 Starting application..."
node server.js
