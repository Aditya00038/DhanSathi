# Terraform configuration for GCP Cloud Run deployment

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "asia-south1"
}

variable "gemini_api_key" {
  description = "Gemini API Key"
  type        = string
  sensitive   = true
}

# Secret Manager for API keys
resource "google_secret_manager_secret" "gemini_key" {
  secret_id = "dhansathi-gemini-key"

  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret_version" "gemini_key" {
  secret      = google_secret_manager_secret.gemini_key.id
  secret_data = var.gemini_api_key
}

# Cloud Run service
resource "google_cloud_run_service" "backend" {
  name     = "dhansathi-backend"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/dhansathi-backend:latest"

        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
        }

        env {
          name  = "DEBUG"
          value = "false"
        }

        env {
          name  = "AI_PROVIDER"
          value = "gemini"
        }

        env {
          name = "GEMINI_API_KEY"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.gemini_key.secret_id
              key  = "latest"
            }
          }
        }
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = "10"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Make the service publicly accessible
resource "google_cloud_run_service_iam_member" "public" {
  service  = google_cloud_run_service.backend.name
  location = google_cloud_run_service.backend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "backend_url" {
  value = google_cloud_run_service.backend.status[0].url
}
