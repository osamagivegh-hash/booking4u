@echo off
echo ========================================
echo    FIXING REACT FRONTEND SERVING
echo ========================================
echo.

echo Step 1: Adding changes to git...
git add backend/server.js
echo.

echo Step 2: Committing the fix...
git commit -m "FIX: Move API root route to /api to allow React frontend serving

- Moved app.get('/', ...) to app.get('/api', ...)
- This allows the catch-all route to serve React frontend at root URL
- Added fs module import for file system operations
- Now React app will be served at / instead of API JSON response
- API endpoints still available at /api/* routes

Fixes the issue where visiting main URL showed API JSON instead of React app"
echo.

echo Step 3: Pushing to remote repository...
git push origin main
echo.

echo ========================================
echo    SUCCESS! React frontend fix applied
echo ========================================
echo.
echo Your React frontend will now be served at the main URL!
echo API endpoints are still available at /api/*
echo.
echo After deployment, you should see:
echo - React app at: https://your-app.onrender.com/
echo - API info at: https://your-app.onrender.com/api
echo - Health check at: https://your-app.onrender.com/api/health
echo.
pause

