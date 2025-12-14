from typing import List
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app import models
from app.auth import get_db, get_current_user
from app.schemas import ChatMessageIn, ChatMessageOut
from app.adapters.ai_adapter import AIAdapter

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.get("/history", response_model=List[ChatMessageOut])
def get_chat_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    messages = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.user_id == current_user.id)
        .order_by(models.ChatMessage.created_at.desc())
        .limit(limit)
        .all()
    )
    return list(reversed(messages))


@router.post("/send", response_model=ChatMessageOut)
def send_message(
    msg_in: ChatMessageIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Save user message
    user_msg = models.ChatMessage(
        user_id=current_user.id,
        role="user",
        content=msg_in.content,
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # Generate AI response
    adapter = AIAdapter()
    
    # Build context from user's financial data
    transactions = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id
    ).order_by(models.Transaction.timestamp.desc()).limit(10).all()
    
    context = f"User: {current_user.full_name}\n"
    if transactions:
        total_income = sum(t.amount for t in transactions if t.amount > 0)
        total_expense = sum(abs(t.amount) for t in transactions if t.amount < 0)
        context += f"Recent income: ₹{total_income}, Recent expenses: ₹{total_expense}\n"
    
    prompt = f"{context}\nUser question: {msg_in.content}\n\nProvide helpful financial advice:"
    ai_response = adapter.chat(prompt)

    # Save AI response
    ai_msg = models.ChatMessage(
        user_id=current_user.id,
        role="assistant",
        content=ai_response,
    )
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    return ai_msg


@router.delete("/clear")
def clear_chat_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db.query(models.ChatMessage).filter(
        models.ChatMessage.user_id == current_user.id
    ).delete()
    db.commit()
    return {"ok": True}
