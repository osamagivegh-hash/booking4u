@echo off
echo Pushing CORS fixes...
git add .
git commit -m "Fix CORS and root route"
git push origin main
echo Done!
pause
