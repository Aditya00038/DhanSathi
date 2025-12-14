from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app import models
from app.auth import get_db, get_current_user
from app.routes.goals import Goal

router = APIRouter(prefix="/api/insights", tags=["insights"])


@router.get("/summary")
def get_financial_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Get comprehensive financial insights"""
    
    # Get all transactions
    transactions = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    ).all()
    
    # Calculate totals
    total_income = sum(t.amount for t in transactions if t.amount > 0)
    total_expenses = sum(abs(t.amount) for t in transactions if t.amount < 0)
    total_savings = total_income - total_expenses
    savings_rate = (total_savings / total_income * 100) if total_income > 0 else 0
    
    # Category breakdown
    expense_by_category = {}
    income_by_category = {}
    for t in transactions:
        if t.amount < 0:
            expense_by_category[t.category] = expense_by_category.get(t.category, 0) + abs(t.amount)
        else:
            income_by_category[t.category] = income_by_category.get(t.category, 0) + t.amount
    
    # Monthly trends (last 6 months)
    monthly_data = []
    for i in range(6):
        month_start = datetime.utcnow().replace(day=1) - timedelta(days=30 * i)
        month_end = month_start + timedelta(days=30)
        month_txs = [t for t in transactions if month_start <= t.timestamp < month_end]
        monthly_data.append({
            "month": month_start.strftime("%b %Y"),
            "income": sum(t.amount for t in month_txs if t.amount > 0),
            "expenses": sum(abs(t.amount) for t in month_txs if t.amount < 0),
        })
    
    # Goals progress
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    active_goals = len([g for g in goals if g.status == "active"])
    completed_goals = len([g for g in goals if g.status == "completed"])
    total_goal_saved = sum(g.current_amount for g in goals)
    
    # Financial health score (simplified calculation)
    health_score = 5.0  # Base score
    if savings_rate > 20:
        health_score += 2.0
    elif savings_rate > 10:
        health_score += 1.0
    if total_expenses < total_income * 0.8:
        health_score += 1.5
    if active_goals > 0 and any(g.current_amount > 0 for g in goals if g.status == "active"):
        health_score += 1.0
    health_score = min(10.0, health_score)
    
    return {
        "currentBalance": total_savings,
        "totalIncome": total_income,
        "totalExpenses": total_expenses,
        "totalSavings": total_savings,
        "savingsRate": round(savings_rate, 1),
        "expenseRatio": round(100 - savings_rate, 1) if savings_rate < 100 else 0,
        "projectedBalance": total_savings * 1.03,  # 3% growth projection
        "financialHealthScore": round(health_score, 1),
        "expenseByCategory": [
            {"name": k, "value": v} for k, v in expense_by_category.items()
        ],
        "incomeByCategory": [
            {"name": k, "value": v} for k, v in income_by_category.items()
        ],
        "monthlyTrends": list(reversed(monthly_data)),
        "goals": {
            "active": active_goals,
            "completed": completed_goals,
            "totalSaved": total_goal_saved,
        },
        "insights": generate_insights(
            total_income, total_expenses, expense_by_category, savings_rate
        ),
        "recommendations": generate_recommendations(
            total_income, total_expenses, expense_by_category, savings_rate, goals
        ),
    }


def generate_insights(income: float, expenses: float, expense_breakdown: dict, savings_rate: float) -> list:
    """Generate AI-powered insights based on financial data"""
    insights = []
    
    if savings_rate >= 70:
        insights.append({
            "title": "Excellent Savings",
            "detail": f"You're saving {savings_rate:.0f}% of your income. This is exceptional financial discipline!"
        })
    elif savings_rate >= 30:
        insights.append({
            "title": "Good Savings Rate",
            "detail": f"Your {savings_rate:.0f}% savings rate is above average. Keep it up!"
        })
    elif savings_rate >= 10:
        insights.append({
            "title": "Room for Improvement",
            "detail": f"Your {savings_rate:.0f}% savings rate is below the recommended 20%. Consider reducing discretionary spending."
        })
    else:
        insights.append({
            "title": "Savings Alert",
            "detail": "Your savings rate is very low. Review your expenses to find areas to cut back."
        })
    
    # Top expense category insight
    if expense_breakdown:
        top_category = max(expense_breakdown.items(), key=lambda x: x[1])
        insights.append({
            "title": "Top Expense Category",
            "detail": f"'{top_category[0]}' is your largest expense at ₹{top_category[1]:,.0f}. Consider if this aligns with your priorities."
        })
    
    return insights


def generate_recommendations(income: float, expenses: float, expense_breakdown: dict, savings_rate: float, goals: list) -> list:
    """Generate personalized recommendations"""
    recommendations = []
    
    if savings_rate < 20:
        recommendations.append({
            "category": "Savings",
            "suggestion": "Aim to save at least 20% of your income",
            "action": "Set up automatic transfers to a savings account on payday"
        })
    
    # Check for high discretionary spending
    discretionary = expense_breakdown.get("entertainment", 0) + expense_breakdown.get("shopping", 0)
    if discretionary > income * 0.3:
        recommendations.append({
            "category": "Discretionary Spending",
            "suggestion": f"Your entertainment and shopping expenses (₹{discretionary:,.0f}) exceed 30% of income",
            "action": "Try the 50/30/20 budget rule to balance your spending"
        })
    
    # Goal-based recommendations
    active_goals = [g for g in goals if g.status == "active"]
    if active_goals:
        underfunded = [g for g in active_goals if g.current_amount < g.target_amount * 0.5]
        if underfunded:
            recommendations.append({
                "category": "Goals",
                "suggestion": f"You have {len(underfunded)} goal(s) that are less than 50% funded",
                "action": "Consider allocating more monthly savings to reach your goals on time"
            })
    
    return recommendations
