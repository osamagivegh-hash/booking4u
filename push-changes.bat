@echo off
echo 🚀 Pushing integrated deployment changes to GitHub...

echo.
echo Step 1: Adding all changes...
git add .

echo.
echo Step 2: Committing changes...
git commit -m "Integrated frontend-backend deployment - eliminates CORS issues

- Backend now serves React frontend static files
- Single Render service for both frontend and backend
- No CORS issues (same origin)
- Simplified deployment configuration
- React Router catch-all handler added
- Removed proxy from frontend package.json
- Updated API configuration for same-origin
- Created build and deployment scripts"

echo.
echo Step 3: Pushing to GitHub...
git push origin main

echo.
echo ✅ Changes pushed successfully to GitHub!
echo.
echo 📋 Next Steps:
echo 1. Go to Render dashboard
echo 2. Wait for automatic deployment to complete
echo 3. Test the new integrated service
echo.
echo 🎯 The integrated deployment will eliminate all CORS issues!
echo.
pause
