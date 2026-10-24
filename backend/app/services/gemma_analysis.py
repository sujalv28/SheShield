"""Gemma-powered analysis for uploaded Chicago incident data.

Gemma is used for interpretation and narrative analysis only. The routing
engine continues to use the deterministic scoring pipeline in the backend.
"""
import json
import logging
import os
from collections.abc import Mapping, Sequence
from typing import Any

logger = logging.getLogger(__name__)

GEMMA_MODEL = os.getenv("GEMMA_MODEL", "gemma-4-31b-it")
MAX_ROWS_SENT_TO_MODEL = 500


def _build_prompt(filename: str, rows: Sequence[Mapping[str, Any]]) -> str:
    """Build a bounded, structured prompt from the uploaded incident rows."""
    categories: dict[str, int] = {}
    latitudes: list[float] = []
    longitudes: list[float] = []
    date_values: list[str] = []

    for row in rows:
        category = str(row.get("category") or "Unspecified").strip()
        categories[category] = categories.get(category, 0) + 1
        try:
            latitudes.append(float(row["latitude"]))
            longitudes.append(float(row["longitude"]))
        except (KeyError, TypeError, ValueError):
            pass
        if row.get("date_time"):
            date_values.append(str(row["date_time"]))

    summary = {
        "filename": filename,
        "record_count": len(rows),
        "category_counts": categories,
        "coordinate_bounds": {
            "min_latitude": min(latitudes) if latitudes else None,
            "max_latitude": max(latitudes) if latitudes else None,
            "min_longitude": min(longitudes) if longitudes else None,
            "max_longitude": max(longitudes) if longitudes else None,
        },
        "date_range": {
            "earliest": min(date_values) if date_values else None,
            "latest": max(date_values) if date_values else None,
        },
        "rows": list(rows[:MAX_ROWS_SENT_TO_MODEL]),
    }

    return f"""You are analyzing Chicago incident data for SafePath, a women-safety navigation prototype.

Analyze the supplied dataset and return a concise, evidence-based report with these sections:
1. Coverage and data quality
2. Most common incident categories
3. Spatial or temporal patterns visible in the supplied records
4. Implications for route-level safety scoring
5. Important limitations and bias warnings

Do not invent locations, trends, causal explanations, or statistics that are not supported by the data.
Use relative safety language, avoid labeling neighborhoods as unsafe, and mention when the sample is too small.

Dataset summary and sample records:
{json.dumps(summary, ensure_ascii=False, default=str)}
"""


def analyze_incidents(filename: str, rows: Sequence[Mapping[str, Any]]) -> dict[str, Any]:
    """Call Gemma and return a safe-to-serialize analysis result."""
    api_key = os.getenv("API_KEY")
    if not api_key:
        return {
            "status": "not_configured",
            "model": GEMMA_MODEL,
            "message": "Gemma analysis skipped: API_KEY is not configured.",
        }

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=_build_prompt(filename, rows))],
            )
        ]

        # Keep the model call aligned with gemma_4.txt while avoiding external
        # web grounding: this report must be based only on the uploaded data.
        config = types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_level="HIGH"),
        )

        chunks: list[str] = []
        for chunk in client.models.generate_content_stream(
            model=GEMMA_MODEL,
            contents=contents,
            config=config,
        ):
            if chunk.text:
                chunks.append(chunk.text)

        analysis = "".join(chunks).strip()
        if not analysis:
            return {
                "status": "empty",
                "model": GEMMA_MODEL,
                "message": "Gemma returned no analysis.",
            }
        return {"status": "success", "model": GEMMA_MODEL, "analysis": analysis}
    except Exception as exc:  # Model availability must not block CSV ingestion.
        logger.warning("Gemma analysis unavailable: %s", exc)
        return {
            "status": "error",
            "model": GEMMA_MODEL,
            "message": "Gemma analysis could not be completed; CSV ingestion still succeeded.",
        }
