@echo off
echo ========================================
echo Fixing Dependency Conflicts
echo ========================================

echo.
echo Adding frontend/package.json changes...
git add frontend/package.json

echo.
echo Committing dependency conflict fix...
git commit -m "Fix dependency conflicts: Remove TypeScript ESLint dependencies

- Removed @typescript-eslint/eslint-plugin and @typescript-eslint/parser
- These were conflicting with react-scripts built-in ESLint config
- Kept other ESLint plugins for JavaScript React development
- This resolves the ERESOLVE dependency conflict"

echo.
echo Pushing to origin main...
git push origin main

echo.
echo ========================================
echo Dependency conflicts fixed!
echo ========================================
echo.
echo Now you can run:
echo cd frontend
echo npm install
echo.
pause
