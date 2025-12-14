# Terraform configuration for Azure App Service deployment

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

variable "location" {
  description = "Azure Region"
  type        = string
  default     = "Central India"
}

variable "gemini_api_key" {
  description = "Gemini API Key"
  type        = string
  sensitive   = true
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "dhansathi-rg"
  location = var.location
}

# App Service Plan (Free tier)
resource "azurerm_service_plan" "main" {
  name                = "dhansathi-plan"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "F1" # Free tier
}

# Backend App Service
resource "azurerm_linux_web_app" "backend" {
  name                = "dhansathi-backend"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    application_stack {
      python_version = "3.10"
    }

    app_command_line = "uvicorn app.main:app --host 0.0.0.0 --port 8000"
  }

  app_settings = {
    "DEBUG"                          = "false"
    "AI_PROVIDER"                    = "gemini"
    "GEMINI_API_KEY"                 = var.gemini_api_key
    "SCM_DO_BUILD_DURING_DEPLOYMENT" = "true"
  }
}

# Static Web App for Frontend
resource "azurerm_static_site" "frontend" {
  name                = "dhansathi-frontend"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  sku_tier            = "Free"
  sku_size            = "Free"
}

output "backend_url" {
  value = "https://${azurerm_linux_web_app.backend.default_hostname}"
}

output "frontend_url" {
  value = azurerm_static_site.frontend.default_host_name
}
