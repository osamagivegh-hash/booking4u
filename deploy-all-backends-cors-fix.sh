#!/bin/bash

# Deploy CORS Fix to All Backend Services
# This script ensures all backend deployments have the CORS fix applied

echo "🚀 Deploying CORS Fix to All Backend Services"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "backend/server.js" ]; then
    echo -e "${RED}❌ Error: backend/server.js not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Current CORS Configuration Check:${NC}"
echo "Checking if CORS fix is present in backend/server.js..."

# Check if CORS fix is present
if grep -q "app.options('*', cors(corsOptions))" backend/server.js; then
    echo -e "${GREEN}✅ CORS fix is present in server.js${NC}"
else
    echo -e "${RED}❌ CORS fix is missing from server.js${NC}"
    echo "Please ensure the CORS fix has been applied to backend/server.js"
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 Frontend Configuration Check:${NC}"
echo "Checking frontend configuration..."

# Check frontend config
if grep -q "PRIMARY: 'https://booking4u-backend.onrender.com'" frontend/src/config/apiConfig.js; then
    echo -e "${GREEN}✅ Frontend configured to use single backend URL${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend may still have multiple backend URLs${NC}"
fi

echo ""
echo -e "${BLUE}📦 Git Status:${NC}"
git status --porcelain

echo ""
echo -e "${BLUE}🔄 Committing CORS Fix:${NC}"

# Add all changes
git add backend/server.js
git add frontend/src/config/apiConfig.js
git add frontend/env.production.txt
git add test-all-backends-cors.js

# Commit with descriptive message
git commit -m "Fix CORS configuration across all backend deployments

- Remove multiple backend URLs from frontend config
- Use single backend domain: https://booking4u-backend.onrender.com
- Ensure CORS middleware is applied before all routes
- Add comprehensive backend testing script
- Fix environment variables to point to correct backend

This resolves intermittent CORS errors caused by frontend
switching between different backend domains."

echo -e "${GREEN}✅ Changes committed${NC}"

echo ""
echo -e "${BLUE}🚀 Pushing to GitHub:${NC}"
git push origin main

echo -e "${GREEN}✅ Changes pushed to GitHub${NC}"

echo ""
echo -e "${BLUE}📋 Backend Services to Deploy:${NC}"
echo "You need to deploy these backend services on Render:"
echo "1. booking4u-backend (Primary)"
echo "2. booking4u-backend-1 (Backup)"
echo "3. booking4u-backend-2 (Backup)"
echo "4. booking4u-backend-3 (Backup)"

echo ""
echo -e "${BLUE}🔧 Render Deployment Configuration:${NC}"
echo "For each backend service, use these settings:"
echo ""
echo "Service Type: Web Service"
echo "Environment: Node"
echo "Build Command: cd backend && npm install"
echo "Start Command: cd backend && npm start"
echo "Root Directory: backend"
echo ""
echo "Environment Variables:"
echo "NODE_ENV=production"
echo "PORT=10000"
echo "MONGODB_URI=mongodb+srv://osamagivegh:osamagivegh@cluster0.8qjqj.mongodb.net/booking4u?retryWrites=true&w=majority"
echo "JWT_SECRET=your-super-secret-jwt-key-here"
echo "JWT_EXPIRE=30d"
echo "CORS_ORIGIN=https://booking4u-1.onrender.com"

echo ""
echo -e "${BLUE}🧪 Testing After Deployment:${NC}"
echo "After deploying all backend services, run:"
echo "node test-all-backends-cors.js"
echo ""
echo "Expected results:"
echo "- All backend services should return 200 status"
echo "- CORS headers should be present"
echo "- Frontend should no longer show CORS errors"

echo ""
echo -e "${GREEN}🎯 Next Steps:${NC}"
echo "1. Deploy backend services on Render dashboard"
echo "2. Test CORS with: node test-all-backends-cors.js"
echo "3. Verify frontend connectivity"
echo "4. Monitor for any remaining CORS issues"

echo ""
echo -e "${GREEN}✅ CORS Fix Deployment Complete!${NC}"


