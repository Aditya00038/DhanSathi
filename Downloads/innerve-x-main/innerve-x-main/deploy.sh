#!/bin/bash
# Simple deployment script for Vercel

echo "🚀 Deploying DhanSathi to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy
echo "Starting deployment..."
vercel --prod

echo "✅ Deployment complete!"
echo "Don't forget to:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Update CORS settings in app/main.py"
echo "3. Test your deployment"
