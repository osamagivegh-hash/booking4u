#!/bin/bash

echo "🚀 Setting up Booking4U Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. Some features may not work."
fi

echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "🔧 Setting up environment files..."
cd ../backend
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Backend .env file created from template"
else
    echo "ℹ️  Backend .env file already exists"
fi

cd ../frontend
if [ ! -f .env ]; then
    cp env.example.txt .env
    echo "✅ Frontend .env file created from template"
else
    echo "ℹ️  Frontend .env file already exists"
fi

echo "🐳 Starting Docker services..."
cd ..
if command -v docker &> /dev/null; then
    docker-compose up -d mongodb
    echo "✅ MongoDB container started"
else
    echo "⚠️  Docker not available. Please start MongoDB manually."
fi

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the backend: cd backend && npm run dev"
echo "2. Start the frontend: cd frontend && npm start"
echo "3. Access the app at: http://localhost:3000"
echo "4. API docs at: http://localhost:5000/api-docs"
echo ""
echo "Happy coding! 🚀"


