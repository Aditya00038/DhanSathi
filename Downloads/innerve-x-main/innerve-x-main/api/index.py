"""
Vercel serverless function entry point for FastAPI
"""
import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.main import app

# Vercel handler
handler = app
