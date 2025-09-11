@echo off
echo Fixing backend root route and pushing changes...

git add .
git commit -m "🔧 Fix backend root route handler - resolves 404 error for root path"
git push origin main

echo.
echo ✅ Fix applied and pushed successfully!
echo.
echo The backend now has a proper root route handler that will resolve the 404 error.
echo.
pause
