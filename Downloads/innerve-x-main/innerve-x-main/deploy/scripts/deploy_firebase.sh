#!/bin/bash
# DhanSathi - Firebase Hosting Deployment (Frontend)
# Prerequisites: firebase-tools installed and authenticated

set -e

echo "🚀 Deploying DhanSathi Frontend to Firebase Hosting..."

# Check if firebase is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install with: npm install -g firebase-tools"
    exit 1
fi

# Navigate to frontend
cd ../frontend

# Build frontend
echo "🏗️ Building frontend..."
npm run build

# Initialize Firebase if not already done
if [ ! -f "firebase.json" ]; then
    echo "📋 Initializing Firebase..."
    firebase init hosting --public dist --single-page true
fi

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy --only hosting

echo "✅ Frontend deployed!"
echo ""
echo "📝 Don't forget to:"
echo "1. Update VITE_API_BASE_URL in .env.production to your Cloud Run URL"
echo "2. Rebuild and redeploy if you change API URL"
