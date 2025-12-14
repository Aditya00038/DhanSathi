from typing import List

from app.adapters.ai_adapter import AIAdapter
from app.schemas import AgentResult, BudgetRecommendation, Insight, TransactionOut


def generate_insights(transactions: List[TransactionOut], provider: str = "local") -> AgentResult:
    adapter = AIAdapter(provider)
    total_spend = sum(t.amount for t in transactions)
    categories = sorted({t.category for t in transactions})

    insights = [
        Insight(title="Total spend", detail=f"You spent {total_spend:.2f} across {len(transactions)} transactions."),
    ]
    if total_spend > 0:
        insights.append(Insight(title="Top category", detail=f"Categories seen: {', '.join(categories)}"))

    budget = [
        BudgetRecommendation(
            category=cat,
            suggested_limit=max(50.0, total_spend * 0.2),
            rationale="Auto-estimated at 20% of recent spend; adjust as needed.",
        )
        for cat in categories
    ]

    summary = adapter.chat("Give a concise financial insight summary for a user.")

    return AgentResult(insights=insights, budget=budget, categories=categories, summary=summary)
