@echo off
echo ========================================
echo Committing and pushing changes to git
echo ========================================

echo.
echo Adding all changes...
git add .

echo.
echo Committing changes...
git commit -m "Complete socket.io removal and CORS fixes - ready for deployment"

echo.
echo Pushing to origin main...
git push origin main

echo.
echo ========================================
echo Git push completed!
echo ========================================
echo.
echo Next steps:
echo 1. Go to Render Dashboard
echo 2. Find booking4u-backend service
echo 3. Click "Manual Deploy" -> "Deploy latest commit"
echo 4. Wait for deployment to complete
echo 5. Test: https://booking4u-backend.onrender.com/api/health
echo.
pause
