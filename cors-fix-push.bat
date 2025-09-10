@echo off
echo ========================================
echo CORS Fix - Adding GitHub Pages origin
echo ========================================

echo.
echo Adding backend/server.js changes...
git add backend/server.js

echo.
echo Committing CORS fix...
git commit -m "Fix CORS: Add GitHub Pages origin to allowed origins"

echo.
echo Pushing to origin main...
git push origin main

echo.
echo ========================================
echo CORS fix pushed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Go to Render Dashboard
echo 2. Find booking4u-backend service  
echo 3. Click "Manual Deploy" -> "Deploy latest commit"
echo 4. Wait for deployment to complete
echo 5. Test your frontend again
echo.
pause
