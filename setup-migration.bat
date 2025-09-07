@echo off
echo ========================================
echo Booking4U MongoDB Migration Setup
echo ========================================
echo.

echo Installing MongoDB driver...
npm install mongodb

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update your Atlas password in migrate-to-atlas.js
echo 2. Make sure your local MongoDB is running
echo 3. Run: node migrate-to-atlas.js
echo.
echo For detailed instructions, see MIGRATION_GUIDE.md
echo.
pause
