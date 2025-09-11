#!/bin/bash

# Build script for integrated frontend-backend deployment
set -e

echo "🚀 Building integrated Booking4U application..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Installing backend dependencies...${NC}"
cd backend
npm install
cd ..

echo -e "${BLUE}Step 2: Installing frontend dependencies...${NC}"
cd frontend
npm install

echo -e "${BLUE}Step 3: Building React frontend...${NC}"
npm run build

echo -e "${BLUE}Step 4: Copying build to backend directory...${NC}"
# Create the build directory in backend if it doesn't exist
mkdir -p ../backend/frontend-build

# Copy the build files
cp -r build/* ../backend/frontend-build/

cd ..

echo -e "${GREEN}✅ Integrated build completed successfully!${NC}"
echo -e "${YELLOW}📁 Frontend build copied to: backend/frontend-build/${NC}"
echo -e "${YELLOW}🚀 Ready for deployment!${NC}"
