@echo off
echo ========================================
echo Fixing allowedOrigins ReferenceError
echo ========================================
echo.

echo 🐛 Issue: ReferenceError: allowedOrigins is not defined
echo ✅ Fix: Removed all references to allowedOrigins variable
echo ✅ Updated: All CORS endpoints to use simplified configuration
echo.

echo 1. Committing the fix...
git add backend/server.js
git commit -m "Fix: Remove allowedOrigins references causing ReferenceError in health check"
echo.

echo 2. Pushing fix to repository...
git push origin main
echo.

echo 3. Render will auto-deploy the fix...
echo    - Health check endpoint will work correctly
echo    - No more ReferenceError in logs
echo    - All CORS endpoints updated for Blueprint Integrated
echo.

echo 4. Test after deployment:
echo    - Health check: curl https://your-domain.onrender.com/api/health
echo    - Root health: curl https://your-domain.onrender.com/
echo    - Check Render logs for no more errors
echo.

echo ========================================
echo allowedOrigins Error Fix Complete!
echo ========================================
pause
