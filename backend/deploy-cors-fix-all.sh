#!/bin/bash

# Deploy CORS Fix to All Backend Instances
# This script deploys the updated CORS configuration to all backend instances

set -e

echo "🚀 Deploying CORS Fix to All Backend Instances"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backend instances
BACKENDS=(
    "booking4u-backend"
    "booking4u-backend-1" 
    "booking4u-backend-2"
    "booking4u-backend-3"
)

# Function to deploy to a single backend
deploy_to_backend() {
    local backend_name=$1
    echo -e "\n${BLUE}📦 Deploying to: $backend_name${NC}"
    
    # Check if backend exists
    if ! render services list | grep -q "$backend_name"; then
        echo -e "${YELLOW}⚠️  Backend $backend_name not found, skipping...${NC}"
        return 0
    fi
    
    # Deploy the service
    echo "🔄 Deploying service..."
    if render services deploy "$backend_name" --wait; then
        echo -e "${GREEN}✅ Successfully deployed to $backend_name${NC}"
        
        # Wait a bit for the service to start
        echo "⏳ Waiting for service to start..."
        sleep 30
        
        # Test the deployment
        echo "🧪 Testing deployment..."
        if curl -s -f "https://$backend_name.onrender.com/api/health" > /dev/null; then
            echo -e "${GREEN}✅ Health check passed for $backend_name${NC}"
        else
            echo -e "${RED}❌ Health check failed for $backend_name${NC}"
        fi
    else
        echo -e "${RED}❌ Failed to deploy to $backend_name${NC}"
        return 1
    fi
}

# Main deployment process
echo "🔍 Checking Render CLI authentication..."
if ! render auth whoami > /dev/null 2>&1; then
    echo -e "${RED}❌ Not authenticated with Render CLI${NC}"
    echo "Please run: render auth login"
    exit 1
fi

echo -e "${GREEN}✅ Authenticated with Render CLI${NC}"

# Deploy to each backend
success_count=0
total_count=${#BACKENDS[@]}

for backend in "${BACKENDS[@]}"; do
    if deploy_to_backend "$backend"; then
        ((success_count++))
    fi
done

echo -e "\n${BLUE}📊 Deployment Summary${NC}"
echo "=================="
echo -e "Total backends: $total_count"
echo -e "Successful deployments: ${GREEN}$success_count${NC}"
echo -e "Failed deployments: ${RED}$((total_count - success_count))${NC}"

if [ $success_count -eq $total_count ]; then
    echo -e "\n${GREEN}🎉 All deployments successful!${NC}"
    echo -e "\n${YELLOW}📋 Next Steps:${NC}"
    echo "1. Run the CORS test script: node test-cors-fix.js"
    echo "2. Test the frontend: https://booking4u-1.onrender.com"
    echo "3. Check browser console for CORS errors"
else
    echo -e "\n${RED}⚠️  Some deployments failed. Check the logs above.${NC}"
    exit 1
fi

echo -e "\n${BLUE}🔧 CORS Configuration Applied:${NC}"
echo "• Allowed Origins: https://booking4u-1.onrender.com, http://localhost:3000"
echo "• Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS"
echo "• Headers: Content-Type, Authorization, X-Requested-With"
echo "• Credentials: Enabled"
echo "• Preflight: Handled automatically"

echo -e "\n${GREEN}✨ CORS fix deployment complete!${NC}"
