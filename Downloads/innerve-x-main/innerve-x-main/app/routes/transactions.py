from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models
from app.auth import get_db, get_current_user
from app.schemas import TransactionIn, TransactionOut

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.get("/", response_model=List[TransactionOut])
def list_transactions(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Transaction).filter(models.Transaction.user_id == current_user.id)
    if category:
        query = query.filter(models.Transaction.category == category)
    return query.order_by(models.Transaction.timestamp.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=TransactionOut)
def create_transaction(
    tx_in: TransactionIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    tx = models.Transaction(
        user_id=current_user.id,
        amount=tx_in.amount,
        category=tx_in.category,
        description=tx_in.description,
        timestamp=tx_in.timestamp or datetime.utcnow(),
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@router.post("/bulk", response_model=List[TransactionOut])
def bulk_create_transactions(
    txs: List[TransactionIn],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    created = []
    for tx_in in txs:
        tx = models.Transaction(
            user_id=current_user.id,
            amount=tx_in.amount,
            category=tx_in.category,
            description=tx_in.description,
            timestamp=tx_in.timestamp or datetime.utcnow(),
        )
        db.add(tx)
        created.append(tx)
    db.commit()
    for tx in created:
        db.refresh(tx)
    return created


@router.get("/{tx_id}", response_model=TransactionOut)
def get_transaction(
    tx_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    tx = db.query(models.Transaction).filter(
        models.Transaction.id == tx_id,
        models.Transaction.user_id == current_user.id,
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


@router.delete("/{tx_id}")
def delete_transaction(
    tx_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    tx = db.query(models.Transaction).filter(
        models.Transaction.id == tx_id,
        models.Transaction.user_id == current_user.id,
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(tx)
    db.commit()
    return {"ok": True}
