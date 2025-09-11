@echo off
echo 🚀 Deploying CORS fix for GitHub Pages...

echo.
echo 📋 Step 1: Adding CORS fix to git...
git add backend/server.js

echo.
echo 📋 Step 2: Committing CORS fix...
git commit -m "Fix CORS for GitHub Pages deployment

- Add GitHub Pages domain to allowed origins
- Enhance CORS configuration with explicit headers
- Add dedicated health check endpoint with CORS
- Support multiple deployment environments
- Fix preflight request handling"

echo.
echo 📋 Step 3: Pushing to GitHub...
git push origin main

echo.
echo ✅ CORS fix deployed successfully!
echo.
echo 🔍 Next steps:
echo 1. Wait for backend to restart on Render
echo 2. Test your GitHub Pages site again
echo 3. Check browser console for CORS success
echo.
echo 🌐 Your GitHub Pages URL: https://osamagivegh-hash.github.io/booking4u/
echo 🔧 Backend URL: https://booking4u-backend.onrender.com
echo.
pause

