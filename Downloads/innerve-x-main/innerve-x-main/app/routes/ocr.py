from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from app import models
from app.auth import get_db, get_current_user
from app.schemas import OCRResult
from app.services.ocr import parse_receipt_text

router = APIRouter(prefix="/api/ocr", tags=["ocr"])


@router.post("/receipt", response_model=OCRResult)
async def scan_receipt(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
):
    """
    Upload and parse a receipt image.
    In production, this would use Tesseract or a cloud OCR API.
    For now, we return mock data for demonstration.
    """
    # Read file content (for actual OCR implementation)
    content = await file.read()
    
    # Mock OCR result - in production, you'd process the image
    mock_text = """
    ABC Grocery Store
    Date: 2025-11-29
    
    Milk - Rs. 50
    Bread - Rs. 40
    Vegetables - Rs. 150
    Fruits - Rs. 200
    
    Total: Rs. 440
    """
    
    return parse_receipt_text(mock_text)


@router.post("/passbook")
async def scan_passbook(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
):
    """
    Parse bank passbook image and extract transactions.
    Returns structured transaction data.
    """
    content = await file.read()
    
    # Mock passbook OCR result
    transactions = [
        {"date": "28-06-2022", "description": "LIC OF INDIA", "debit": 500, "credit": None, "balance": 5089.15},
        {"date": "29-06-2022", "description": "UPI/DR/217980570215/NTA JEE/PY", "debit": 650, "credit": None, "balance": 4439.15},
        {"date": "07-07-2022", "description": "Balance Brought Forward", "debit": None, "credit": None, "balance": 1088},
        {"date": "07-07-2022", "description": "DEPOSIT", "debit": None, "credit": 5050, "balance": 6138},
        {"date": "07-07-2022", "description": "WITHDRAWAL", "debit": 500, "credit": None, "balance": 5638},
        {"date": "07-07-2022", "description": "BALANCE", "debit": None, "credit": None, "balance": 6097.54},
    ]
    
    return {
        "success": True,
        "transactions": transactions,
        "count": len(transactions)
    }
