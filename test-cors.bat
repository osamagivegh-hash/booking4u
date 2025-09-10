@echo off
echo ========================================
echo Testing CORS Configuration
echo ========================================

echo.
echo Testing preflight request...
curl -H "Origin: https://booking4u-1.onrender.com" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS --verbose https://booking4u-backend.onrender.com/api/health

echo.
echo.
echo Testing direct API access...
curl -H "Origin: https://booking4u-1.onrender.com" https://booking4u-backend.onrender.com/api/health

echo.
echo.
echo Testing without Origin header...
curl https://booking4u-backend.onrender.com/api/health

echo.
echo ========================================
echo CORS tests completed
echo ========================================
pause
