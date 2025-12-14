from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models
from app.auth import get_db, get_current_user
from app.schemas import HoldingIn, HoldingOut, PortfolioSummary

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


@router.get("/", response_model=PortfolioSummary)
def get_portfolio(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    holdings = db.query(models.Holding).filter(models.Holding.user_id == current_user.id).all()
    total_value = sum(h.quantity * h.avg_cost for h in holdings)
    return PortfolioSummary(total_value=total_value, positions=holdings)


@router.post("/", response_model=HoldingOut)
def add_holding(
    holding_in: HoldingIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing = db.query(models.Holding).filter(
        models.Holding.user_id == current_user.id,
        models.Holding.symbol == holding_in.symbol,
    ).first()
    if existing:
        # Update existing
        total_qty = existing.quantity + holding_in.quantity
        existing.avg_cost = (
            (existing.quantity * existing.avg_cost) + (holding_in.quantity * holding_in.avg_cost)
        ) / total_qty
        existing.quantity = total_qty
        db.commit()
        db.refresh(existing)
        return existing
    holding = models.Holding(
        user_id=current_user.id,
        symbol=holding_in.symbol,
        quantity=holding_in.quantity,
        avg_cost=holding_in.avg_cost,
    )
    db.add(holding)
    db.commit()
    db.refresh(holding)
    return holding


@router.delete("/{symbol}")
def remove_holding(
    symbol: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    holding = db.query(models.Holding).filter(
        models.Holding.user_id == current_user.id,
        models.Holding.symbol == symbol,
    ).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")
    db.delete(holding)
    db.commit()
    return {"ok": True}
