@echo off
echo ========================================
echo Updating Frontend Dependencies
echo ========================================

echo.
echo Adding frontend/package.json changes...
git add frontend/package.json

echo.
echo Committing dependency updates...
git commit -m "Update frontend dependencies to match requirements

- Updated axios to ^1.6.0
- Updated react-hook-form to ^7.47.0  
- Updated react-router-dom to ^6.18.0
- Updated socket.io-client to ^4.7.2
- Updated zustand to ^4.4.4
- Added GENERATE_SOURCEMAP=false to build script
- Updated analyze script to use bundle-analyzer
- Updated serve script with port 3000
- Added lint and lint:fix scripts
- Added TypeScript ESLint dependencies
- Updated browserslist to exclude IE
- Updated engines to require Node >=18.0.0 and npm >=9.0.0
- Added proxy configuration for localhost:10000"

echo.
echo Pushing to origin main...
git push origin main

echo.
echo ========================================
echo Frontend dependencies updated successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Run 'npm install' in the frontend directory
echo 2. Test the build with 'npm run build'
echo 3. Deploy to GitHub Pages if needed
echo.
pause
