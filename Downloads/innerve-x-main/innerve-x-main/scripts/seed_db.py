"""
Seed script for DhanSathi database.
Creates demo user and sample data for testing.

Usage:
    python -m scripts.seed_db
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta
from app.db import SessionLocal, engine, Base
from app.models import User, Transaction, Holding, ChatMessage
from app.routes.goals import Goal
from app.auth import get_password_hash

# Create all tables
Base.metadata.create_all(bind=engine)


def seed_database():
    db = SessionLocal()
    
    try:
        # Check if demo user exists
        existing_user = db.query(User).filter(User.email == "demo@dhan.local").first()
        if existing_user:
            # Update existing user's name
            existing_user.full_name = "Aaditya Hande"
            existing_user.password_hash = get_password_hash("password123")
            db.commit()
            print("Demo user already exists. Updated name to Aaditya Hande.")
            demo_user = existing_user
        else:
            # Create demo user
            demo_user = User(
                email="demo@dhan.local",
                password_hash=get_password_hash("password123"),
                full_name="Aaditya Hande",
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print(f"Created demo user: {demo_user.email}")
        
        # Create sample transactions
        transactions_data = [
            # Income
            {"amount": 50000, "category": "salary", "description": "Monthly Salary - November", "days_ago": 15},
            {"amount": 50000, "category": "salary", "description": "Monthly Salary - October", "days_ago": 45},
            {"amount": 5000, "category": "freelance", "description": "Freelance Project", "days_ago": 10},
            {"amount": 68000, "category": "salary", "description": "Monthly Salary - September", "days_ago": 75},
            
            # Expenses
            {"amount": -2500, "category": "food", "description": "Grocery Shopping", "days_ago": 3},
            {"amount": -1500, "category": "food", "description": "Swiggy Orders", "days_ago": 5},
            {"amount": -2000, "category": "food", "description": "Restaurant Dinner", "days_ago": 8},
            {"amount": -500, "category": "food", "description": "Coffee & Snacks", "days_ago": 2},
            {"amount": -1200, "category": "utilities", "description": "Electricity Bill", "days_ago": 12},
            {"amount": -800, "category": "utilities", "description": "Internet Bill", "days_ago": 14},
            {"amount": -500, "category": "utilities", "description": "Mobile Recharge", "days_ago": 7},
            {"amount": -3000, "category": "transportation", "description": "Fuel", "days_ago": 6},
            {"amount": -1500, "category": "transportation", "description": "Uber/Ola Rides", "days_ago": 4},
            {"amount": -1200, "category": "transportation", "description": "Metro Pass", "days_ago": 20},
            {"amount": -500, "category": "entertainment", "description": "Netflix Subscription", "days_ago": 18},
            {"amount": -200, "category": "entertainment", "description": "Spotify Subscription", "days_ago": 18},
            {"amount": -1500, "category": "entertainment", "description": "Movie Tickets", "days_ago": 9},
            {"amount": -5000, "category": "shopping", "description": "Amazon Purchase", "days_ago": 11},
            {"amount": -3000, "category": "shopping", "description": "Clothes Shopping", "days_ago": 22},
            {"amount": -2500, "category": "shopping", "description": "Electronics", "days_ago": 30},
            {"amount": -1500, "category": "healthcare", "description": "Doctor Visit", "days_ago": 25},
            {"amount": -500, "category": "healthcare", "description": "Medicines", "days_ago": 16},
            {"amount": -1000, "category": "education", "description": "Online Course", "days_ago": 28},
        ]
        
        for tx_data in transactions_data:
            tx = Transaction(
                user_id=demo_user.id,
                amount=tx_data["amount"],
                category=tx_data["category"],
                description=tx_data["description"],
                timestamp=datetime.utcnow() - timedelta(days=tx_data["days_ago"]),
            )
            db.add(tx)
        
        db.commit()
        print(f"Created {len(transactions_data)} sample transactions")
        
        # Create sample goals
        goals_data = [
            {
                "name": "Emergency Fund",
                "target_amount": 100000,
                "current_amount": 45000,
                "target_date": datetime.utcnow() + timedelta(days=150),
            },
            {
                "name": "Vacation to Goa",
                "target_amount": 30000,
                "current_amount": 12000,
                "target_date": datetime.utcnow() + timedelta(days=180),
            },
            {
                "name": "New Laptop",
                "target_amount": 80000,
                "current_amount": 20000,
                "target_date": datetime.utcnow() + timedelta(days=365),
            },
        ]
        
        for goal_data in goals_data:
            goal = Goal(
                user_id=demo_user.id,
                name=goal_data["name"],
                target_amount=goal_data["target_amount"],
                current_amount=goal_data["current_amount"],
                target_date=goal_data["target_date"],
                status="active",
            )
            db.add(goal)
        
        db.commit()
        print(f"Created {len(goals_data)} sample goals")
        
        # Create sample holdings
        holdings_data = [
            {"symbol": "RELIANCE", "quantity": 10, "avg_cost": 2450},
            {"symbol": "TCS", "quantity": 5, "avg_cost": 3600},
            {"symbol": "INFY", "quantity": 15, "avg_cost": 1500},
            {"symbol": "HDFCBANK", "quantity": 8, "avg_cost": 1650},
        ]
        
        for holding_data in holdings_data:
            holding = Holding(
                user_id=demo_user.id,
                symbol=holding_data["symbol"],
                quantity=holding_data["quantity"],
                avg_cost=holding_data["avg_cost"],
            )
            db.add(holding)
        
        db.commit()
        print(f"Created {len(holdings_data)} sample holdings")
        
        print("\n✅ Database seeded successfully!")
        print("\n📧 Demo Login Credentials:")
        print("   Email: demo@dhan.local")
        print("   Password: password123")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
