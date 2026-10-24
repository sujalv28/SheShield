"""Configuration and constants for SafePath backend."""
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
GRAPH_FILE = DATA_DIR / "chicago_graph_scored.gpickle"
INCIDENTS_CACHE = DATA_DIR / "chicago_incidents.json"
POIS_CACHE = DATA_DIR / "chicago_pois.json"

# Chicago Downtown / Loop bounding box (lat_min, lat_max, lon_min, lon_max)
# Covers Loop, Near North Side, River North, West Loop, South Loop
CHICAGO_BBOX = {
    "north": 41.9050,
    "south": 41.8600,
    "east": -87.6150,
    "west": -87.6550,
}

# Center coordinate for default map positioning
DEFAULT_CENTER = {
    "lat": 41.881832,
    "lng": -87.623177,
    "zoom": 14.5
}

# Risk Scoring Weights (PRD Section 8)
# risk(edge, time) = 0.6 * crime + 0.2 * isolation + 0.25 * poor_lighting - 0.2 * protective_proximity
RISK_WEIGHTS = {
    "crime": 0.60,
    "isolation": 0.20,
    "poor_lighting": 0.25,
    "protective_proximity": 0.20,
}

# Time bucket definitions (Day vs Night)
TIME_BUCKETS = {
    "day": {"start": 7, "end": 20, "lighting_penalty_active": False},
    "night": {"start": 20, "end": 7, "lighting_penalty_active": True},
}
