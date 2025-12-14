from datetime import datetime, timedelta
from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = ""


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = ""
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    email: Optional[str] = None


class TransactionIn(BaseModel):
    amount: float
    category: str = Field(default="uncategorized")
    description: str = Field(default="")
    timestamp: Optional[datetime] = None


class TransactionOut(TransactionIn):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class HoldingIn(BaseModel):
    symbol: str
    quantity: float
    avg_cost: float


class HoldingOut(HoldingIn):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMessageIn(BaseModel):
    content: str


class ChatMessageOut(BaseModel):
    id: int
    user_id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class Insight(BaseModel):
    title: str
    detail: str


class BudgetRecommendation(BaseModel):
    category: str
    suggested_limit: float
    rationale: str


class AgentResult(BaseModel):
    insights: List[Insight] = []
    budget: List[BudgetRecommendation] = []
    categories: List[str] = []
    summary: str = ""


class OCRResult(BaseModel):
    merchant: str = ""
    total: float = 0.0
    items: List[str] = []
    raw_text: str = ""


class PortfolioSummary(BaseModel):
    total_value: float
    positions: List[HoldingOut]
