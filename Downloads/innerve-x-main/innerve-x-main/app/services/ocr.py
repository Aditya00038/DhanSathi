"""OCR service stub.
In production you could integrate Tesseract or a hosted OCR API; here we keep it offline-safe.
"""

from app.schemas import OCRResult


def parse_receipt_text(raw_text: str) -> OCRResult:
    # Very naive extraction for demo; a real integration would parse line items.
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    total = 0.0
    for line in lines:
        for token in line.replace("$", " ").split():
            try:
                total = float(token)
                break
            except ValueError:
                continue
        if total:
            break
    merchant = lines[0] if lines else "Unknown"
    return OCRResult(merchant=merchant, total=total, items=lines, raw_text=raw_text)
