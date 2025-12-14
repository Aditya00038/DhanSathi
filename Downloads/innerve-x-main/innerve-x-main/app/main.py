from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import engine, Base
from app.routes import auth, transactions, portfolio, chat, goals, insights, ocr
from app.routes.goals import Goal  # Import to register the model

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DhanSathi API",
    description="AI-Powered Financial Companion API",
    version="1.0.0",
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://frontend-as1kk3vez-adityas-projects-9c9aa8cb.vercel.app",
        "https://frontend-*.vercel.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(portfolio.router)
app.include_router(chat.router)
app.include_router(goals.router)
app.include_router(insights.router)
app.include_router(ocr.router)


@app.get("/")
def root():
    return {
        "name": "DhanSathi API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
