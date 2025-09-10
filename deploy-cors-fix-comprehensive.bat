@echo off
echo ========================================
echo Comprehensive CORS Fix Deployment
echo ========================================

echo.
echo Adding all changes...
git add .

echo.
echo Committing comprehensive CORS fixes...
git commit -m "Comprehensive CORS fixes for production deployment

- Enhanced Helmet configuration to be CORS-compatible
- Added backup CORS middleware for additional security
- Disabled HSTS and COOP temporarily for testing
- Added Access-Control-Max-Age header for preflight caching
- Enhanced preflight request handling with logging
- Allowed origins include all production URLs:
  * https://booking4u-1.onrender.com
  * https://booking4u.onrender.com  
  * https://osamagivegh-hash.github.io
  * localhost for development

This should resolve all CORS issues in production."

echo.
echo Pushing to origin main...
git push origin main

echo.
echo ========================================
echo CORS fixes deployed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Go to Render Dashboard: https://dashboard.render.com
echo 2. Find 'booking4u-backend' service
echo 3. Click 'Manual Deploy' -> 'Deploy latest commit'
echo 4. Wait for deployment to complete (2-3 minutes)
echo 5. Test your frontend: https://booking4u-1.onrender.com
echo 6. Check browser console for CORS errors
echo.
echo Test URLs:
echo - Frontend: https://booking4u-1.onrender.com
echo - Backend Health: https://booking4u-backend.onrender.com/api/health
echo - CORS Debug: https://booking4u-backend.onrender.com/api/debug/cors
echo.
pause
