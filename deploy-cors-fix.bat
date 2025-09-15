@echo off
echo ========================================
echo CORS Fix Deployment Script
echo ========================================
echo.

echo 1. Committing CORS fixes to git...
git add .
git commit -m "Fix CORS errors: Remove unsafe headers, add healthcheck, update API config"
echo.

echo 2. Pushing changes to repository...
git push origin main
echo.

echo 3. Deployment Status:
echo    - Backend will auto-deploy to: https://booking4u-backend.onrender.com
echo    - Frontend will auto-deploy to: https://booking4u-integrated.onrender.com
echo.

echo 4. Testing endpoints after deployment:
echo    - Health check: curl https://booking4u-backend.onrender.com/
echo    - CORS test: curl -H "Origin: https://booking4u-integrated.onrender.com" https://booking4u-backend.onrender.com/api/test-cors
echo.

echo 5. Monitor deployment in Render dashboard:
echo    - Backend: https://dashboard.render.com/web/srv-xxx
echo    - Frontend: https://dashboard.render.com/web/srv-xxx
echo.

echo ========================================
echo CORS Fix Deployment Complete!
echo ========================================
pause
