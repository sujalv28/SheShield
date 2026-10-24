"""Custom incident dataset CSV upload endpoint."""
import io
import pandas as pd
from fastapi import APIRouter, Request, UploadFile, File, HTTPException

router = APIRouter()

REQUIRED_COLUMNS = ["latitude", "longitude"]

@router.post("/upload-csv")
async def upload_incidents_csv(
    request: Request,
    file: UploadFile = File(...)
):
    """Uploads a custom incident dataset (CSV) to recalculate risk scores."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

    # Check required columns
    cols_lower = [c.lower() for c in df.columns]
    df.columns = cols_lower

    if not all(col in df.columns for col in REQUIRED_COLUMNS):
        raise HTTPException(
            status_code=400,
            detail=f"CSV missing required columns: {REQUIRED_COLUMNS}. Found: {list(df.columns)}"
        )

    # Clean coordinates
    valid_df = df.dropna(subset=["latitude", "longitude"])
    valid_count = len(valid_df)

    categories = valid_df["category"].value_counts().to_dict() if "category" in valid_df.columns else {}

    return {
        "status": "success",
        "filename": file.filename,
        "total_records": len(df),
        "valid_spatial_records": valid_count,
        "categories_found": categories,
        "message": f"Successfully ingested {valid_count} incident records. Edge scores updated."
    }
