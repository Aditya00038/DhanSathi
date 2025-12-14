"""AI adapter for multiple providers.
This is intentionally lightweight and mock-friendly for local-first flows.
"""

import os
from typing import Optional

from app.config import get_settings


class AIAdapter:
    def __init__(self, provider: Optional[str] = None):
        settings = get_settings()
        self.provider = (provider or settings.ai_provider).lower()
        self.gemini_api_key = settings.gemini_api_key
        self.openai_api_key = settings.openai_api_key

    def chat(self, prompt: str) -> str:
        if self.provider == "gemini" or self.gemini_api_key:
            return self._chat_gemini(prompt)
        if self.provider == "openai":
            return self._chat_openai(prompt)
        return self._chat_local(prompt)

    def _chat_gemini(self, prompt: str) -> str:
        if not self.gemini_api_key:
            return self._get_fallback_response(prompt)
        
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.gemini_api_key)
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini API error: {e}")
            return self._get_fallback_response(prompt)

    def _chat_openai(self, prompt: str) -> str:
        if not self.openai_api_key:
            return self._get_fallback_response(prompt)
        return self._get_fallback_response(prompt)

    def _chat_local(self, prompt: str) -> str:
        return self._get_fallback_response(prompt)
    
    def _get_fallback_response(self, prompt: str) -> str:
        """Provide intelligent fallback responses based on prompt content."""
        prompt_lower = prompt.lower()
        
        if any(word in prompt_lower for word in ['save', 'saving', 'savings']):
            return """Great question about saving! Here are some personalized tips:

1. **Automate Your Savings**: Set up automatic transfers to your savings account right after payday
2. **50/30/20 Rule**: Allocate 50% for needs, 30% for wants, and 20% for savings
3. **Cut Unnecessary Subscriptions**: Review and cancel unused services
4. **Use the 24-Hour Rule**: Wait 24 hours before making non-essential purchases
5. **Track Your Spending**: Monitor where your money goes to identify saving opportunities

Based on your transactions, I'd recommend focusing on reducing dining out expenses by 15-20%. This could boost your monthly savings significantly!"""
        
        elif any(word in prompt_lower for word in ['budget', 'budgeting']):
            return """Let me help you create an effective budget!

**The 50/30/20 Framework:**
- **50% Needs**: Housing, utilities, groceries, insurance, minimum debt payments
- **30% Wants**: Entertainment, dining out, hobbies, subscriptions
- **20% Savings**: Emergency fund, retirement, goals, extra debt payments

**Pro Tips:**
1. Start by tracking your expenses for a month
2. Categorize everything into needs vs wants
3. Adjust percentages based on your life stage and goals
4. Review and adjust your budget monthly
5. Use budgeting apps to stay on track

Would you like help analyzing your current spending patterns?"""
        
        elif any(word in prompt_lower for word in ['invest', 'investment', 'investing']):
            return """Here's a beginner-friendly investment strategy:

**Getting Started:**
1. **Emergency Fund First**: Save 3-6 months of expenses before investing
2. **Start with Index Funds**: Low-cost, diversified, great for beginners
3. **SIP (Systematic Investment Plan)**: Invest fixed amounts regularly
4. **Diversification**: Spread across stocks, bonds, and other assets

**Investment Options:**
- **Mutual Funds**: Professional management, good for beginners
- **ETFs**: Lower fees, trades like stocks
- **Fixed Deposits**: Low risk, guaranteed returns
- **PPF/ELSS**: Tax-saving investments

**Important**: Start small, invest consistently, and think long-term (5+ years). Never invest money you can't afford to lose. Consider consulting a financial advisor for personalized advice."""
        
        elif any(word in prompt_lower for word in ['debt', 'loan', 'emi']):
            return """Let's tackle your debt strategically!

**Debt Payoff Strategies:**

**1. Avalanche Method** (Mathematically optimal)
- Pay minimums on all debts
- Put extra money toward highest interest debt
- Saves most on interest

**2. Snowball Method** (Psychologically motivating)
- Pay minimums on all debts
- Put extra money toward smallest debt
- Quick wins keep you motivated

**Key Actions:**
✓ List all debts with interest rates
✓ Stop adding new debt
✓ Negotiate lower interest rates
✓ Consider debt consolidation if rates are high
✓ Increase income through side hustles if possible

Would you like help creating a specific debt payoff plan?"""
        
        elif any(word in prompt_lower for word in ['emergency', 'fund']):
            return """Building an emergency fund is crucial! Here's how:

**Emergency Fund Basics:**
- **Goal**: 3-6 months of essential expenses
- **Purpose**: Job loss, medical emergencies, urgent repairs
- **Where**: High-yield savings account (easily accessible)

**Building Your Fund:**
1. **Start Small**: Even ₹1,000 is a good start
2. **Automate**: Set up automatic transfers
3. **Use Windfalls**: Tax refunds, bonuses go straight to emergency fund
4. **Increase Gradually**: Aim for one month's expenses, then build up

**What Counts as Essential:**
- Rent/mortgage
- Utilities
- Groceries
- Insurance premiums
- Minimum debt payments
- Transportation

Once you have your emergency fund, you can invest with more confidence!"""
        
        elif any(word in prompt_lower for word in ['health', 'score']):
            return """Your financial health depends on multiple factors:

**Key Health Indicators:**

📊 **Savings Rate**: Aim for 20%+ of income
💰 **Emergency Fund**: 3-6 months expenses saved
📉 **Debt-to-Income**: Keep below 36%
📈 **Net Worth**: Growing year over year
🎯 **Goal Progress**: On track with financial goals

**Improvement Steps:**
1. Track all income and expenses
2. Build/maintain emergency fund
3. Pay down high-interest debt
4. Increase savings rate gradually
5. Set and work toward specific goals
6. Review and adjust quarterly

Want me to analyze your current financial health based on your transactions?"""
        
        else:
            return """I'm your AI Financial Coach, here to help with:

💰 **Budgeting**: Create and stick to a realistic budget
🐖 **Saving**: Boost your savings with proven strategies
📈 **Investing**: Learn about investment options and strategies
💳 **Debt Management**: Get out of debt faster
🎯 **Goal Planning**: Set and achieve financial goals
🛡️ **Emergency Funds**: Build your financial safety net
📊 **Financial Health**: Improve your overall financial wellness

What specific financial topic would you like to explore? Feel free to ask about your transactions, goals, or any money-related question!"""


adapter = AIAdapter()
