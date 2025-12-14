# DhanSathi Quick Start Script
# Run this to start both backend and frontend servers

Write-Host "🚀 Starting DhanSathi..." -ForegroundColor Cyan

# Check if virtual environment exists
if (!(Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Install Python dependencies if needed
if (!(Test-Path "venv\Lib\site-packages\fastapi")) {
    Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Check if database exists
if (!(Test-Path "dhan_sathi.db")) {
    Write-Host "Database not found. Seeding database..." -ForegroundColor Yellow
    python -m scripts.seed_db
}

# Start backend in background
Write-Host "Starting backend server on http://localhost:8000..." -ForegroundColor Green
$env:PYTHONPATH = $PWD.Path
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; `$env:PYTHONPATH='$PWD'; python -m uvicorn app.main:app --reload --port 8000"

Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend server..." -ForegroundColor Green
cd frontend

# Install npm dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host ""
Write-Host "✅ DhanSathi is starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 Demo Login:" -ForegroundColor Yellow
Write-Host "   Email: demo@dhan.local" -ForegroundColor White
Write-Host "   Password: password123" -ForegroundColor White
Write-Host ""

# Start frontend dev server
npm run dev
