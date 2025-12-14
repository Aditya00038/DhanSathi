"""
Vercel serverless function entry point for FastAPI
"""
from app.main import app

# Vercel expects the app to be named 'app' or use a handler
handler = app
