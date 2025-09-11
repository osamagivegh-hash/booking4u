@echo off
echo 🚀 Deploying Integrated Booking4U Application...

echo Step 1: Building integrated application...
call build-integrated.bat

echo Step 2: Committing changes...
git add .
git commit -m "🔧 Integrated frontend-backend deployment - eliminates CORS issues

- Backend now serves React frontend static files
- Single Render service for both frontend and backend
- No CORS issues (same origin)
- Simplified deployment configuration
- React Router catch-all handler added"

echo Step 3: Pushing to repository...
git push origin main

echo ✅ Integrated deployment pushed successfully!
echo.
echo 📋 Next Steps:
echo 1. Go to Render dashboard
echo 2. Delete the old separate frontend and backend services
echo 3. Create a new web service using the updated render.yaml
echo 4. The new service will be named 'booking4u-integrated'
echo 5. Both frontend and backend will be available at the same domain
echo.
echo 🎯 Benefits:
echo ✅ No CORS issues
echo ✅ Single domain deployment
echo ✅ Simplified configuration
echo ✅ Better performance
echo.
pause
