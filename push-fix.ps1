Write-Host "🔧 Pushing CORS fixes to resolve the issue..." -ForegroundColor Cyan

# Add all changes
git add .

# Commit with a simple message
git commit -m "Fix backend root route and CORS configuration"

# Push to main
git push origin main

Write-Host "✅ Fix pushed successfully!" -ForegroundColor Green
Write-Host "The backend will now redeploy with the CORS fixes." -ForegroundColor Yellow
Write-Host "Please wait a few minutes for the deployment to complete." -ForegroundColor Yellow
