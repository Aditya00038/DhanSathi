#!/bin/bash
# DhanSathi - Azure App Service Deployment
# Prerequisites: Azure CLI installed and authenticated

set -e

RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-dhansathi-rg}"
LOCATION="${AZURE_LOCATION:-centralindia}"
APP_SERVICE_PLAN="${AZURE_APP_PLAN:-dhansathi-plan}"
BACKEND_APP="${AZURE_BACKEND_APP:-dhansathi-backend}"
FRONTEND_APP="${AZURE_FRONTEND_APP:-dhansathi-frontend}"

echo "🚀 Deploying DhanSathi to Azure..."

# Check if az is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if user is authenticated
if ! az account show &> /dev/null; then
    echo "❌ Not authenticated. Run: az login"
    exit 1
fi

# Create resource group
echo "📋 Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service Plan (Free tier)
echo "📋 Creating App Service Plan (Free tier)..."
az appservice plan create \
    --name $APP_SERVICE_PLAN \
    --resource-group $RESOURCE_GROUP \
    --sku F1 \
    --is-linux

# Create Backend Web App
echo "🏗️ Creating backend web app..."
az webapp create \
    --name $BACKEND_APP \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_SERVICE_PLAN \
    --runtime "PYTHON:3.10"

# Configure backend
echo "⚙️ Configuring backend..."
az webapp config appsettings set \
    --name $BACKEND_APP \
    --resource-group $RESOURCE_GROUP \
    --settings \
        DEBUG=false \
        AI_PROVIDER=local \
        SCM_DO_BUILD_DURING_DEPLOYMENT=true

# Deploy backend
echo "📤 Deploying backend..."
cd ..
zip -r deploy.zip . -x "frontend/*" -x ".git/*" -x "venv/*" -x "__pycache__/*"
az webapp deployment source config-zip \
    --name $BACKEND_APP \
    --resource-group $RESOURCE_GROUP \
    --src deploy.zip
rm deploy.zip

BACKEND_URL="https://${BACKEND_APP}.azurewebsites.net"

# Create Static Web App for frontend (Free tier)
echo "🏗️ Creating frontend static web app..."
cd frontend
npm run build

az staticwebapp create \
    --name $FRONTEND_APP \
    --resource-group $RESOURCE_GROUP \
    --source "." \
    --location $LOCATION \
    --branch main \
    --app-location "/" \
    --output-location "dist" \
    --login-with-github

echo "✅ Deployment complete!"
echo ""
echo "📝 URLs:"
echo "Backend API: $BACKEND_URL"
echo "Frontend: Check Azure Portal for Static Web App URL"
echo ""
echo "📝 Next steps:"
echo "1. Set GEMINI_API_KEY in Azure Portal > App Service > Configuration"
echo "2. Update frontend .env.production with backend URL"
echo "3. Redeploy frontend after updating API URL"
