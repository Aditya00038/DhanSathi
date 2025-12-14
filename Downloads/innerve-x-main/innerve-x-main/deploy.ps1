# Simple deployment script for Vercel
Write-Host "🚀 Deploying DhanSathi to Vercel..." -ForegroundColor Cyan

# Check if vercel CLI is installed
$vercelExists = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelExists) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Deploy
Write-Host "Starting deployment..." -ForegroundColor Green
vercel --prod

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Don't forget to:" -ForegroundColor Yellow
Write-Host "1. Set environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "2. Update CORS settings in app/main.py" -ForegroundColor White
Write-Host "3. Test your deployment" -ForegroundColor White
Write-Host ""
Write-Host "Environment Variables needed:" -ForegroundColor Cyan
Write-Host "- GEMINI_API_KEY" -ForegroundColor White
Write-Host "- SECRET_KEY" -ForegroundColor White
Write-Host "- AI_PROVIDER=gemini" -ForegroundColor White
Write-Host "- PYTHONPATH=." -ForegroundColor White
