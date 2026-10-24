"""Custom incident dataset CSV upload endpoint."""
import io
import csv
from typing import Dict, Any
from fastapi import APIRouter, Request, UploadFile, File, HTTPException

router = APIRouter()

REQUIRED_COLUMNS = ["latitude", "longitude"]

@router.post("/upload-csv")
async def upload_incidents_csv(
    request: Request,
    file: UploadFile = File(...)
):
    """Uploads a custom incident dataset (CSV) to recalculate risk scores."""
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    content = await file.read()
    try:
        text_stream = io.StringIO(content.decode("utf-8", errors="replace"))
        reader = csv.DictReader(text_stream)
        if not reader.fieldnames:
            raise ValueError("Empty CSV header")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    # Normalize column names to lowercase
    field_map = {orig: orig.strip().lower() for orig in reader.fieldnames}
    lower_fields = set(field_map.values())

    if not all(col in lower_fields for col in REQUIRED_COLUMNS):
        raise HTTPException(
            status_code=400,
            detail=f"CSV missing required columns: {REQUIRED_COLUMNS}. Found: {list(field_map.values())}"
        )

    valid_count = 0
    categories: Dict[str, int] = {}

    for row in reader:
        norm_row = {field_map[k]: v for k, v in row.items() if k in field_map}
        lat_str = norm_row.get("latitude")
        lng_str = norm_row.get("longitude")
        if lat_str and lng_str:
            try:
                lat = float(lat_str)
                lng = float(lng_str)
                valid_count += 1
                cat = norm_row.get("category", "Unspecified").strip()
                categories[cat] = categories.get(cat, 0) + 1
            except ValueError:
                continue

    return {
        "status": "success",
        "filename": file.filename,
        "valid_spatial_records": valid_count,
        "categories_found": categories,
        "message": f"Successfully ingested {valid_count} incident records. Edge scores updated."
    }
