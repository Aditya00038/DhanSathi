#!/bin/bash
# DhanSathi - GCP Cloud Run Deployment
# Prerequisites: gcloud CLI installed and authenticated

set -e

PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="${GCP_REGION:-asia-south1}"
SERVICE_NAME="dhansathi-backend"

echo "🚀 Deploying DhanSathi to Google Cloud Run..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list 2>&1 | grep -q "ACTIVE"; then
    echo "❌ Not authenticated. Run: gcloud auth login"
    exit 1
fi

# Set project
echo "📋 Setting project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Build and deploy backend
echo "🏗️ Building and deploying backend..."
cd ..

gcloud run deploy $SERVICE_NAME \
    --source . \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars "DEBUG=false,AI_PROVIDER=gemini"

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)')

echo "✅ Backend deployed to: $SERVICE_URL"
echo ""
echo "📝 Next steps:"
echo "1. Set secrets in Secret Manager:"
echo "   gcloud secrets create SECRET_KEY --replication-policy=automatic"
echo "   gcloud secrets create GEMINI_API_KEY --replication-policy=automatic"
echo ""
echo "2. Update Cloud Run service to use secrets"
echo ""
echo "3. Deploy frontend to Firebase Hosting (run deploy_firebase.sh)"
