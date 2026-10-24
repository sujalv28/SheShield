"""Risk overlay GeoJSON endpoint."""
from typing import Literal
from fastapi import APIRouter, Request, Query
from ..models import RiskOverlayResponse

router = APIRouter()

def get_risk_color(score: float) -> str:
    """Returns a color hex according to risk score [0.0 - 1.0]."""
    if score < 0.25:
        return "#10b981"  # Safe (Emerald)
    elif score < 0.50:
        return "#facc15"  # Low-Moderate (Yellow)
    elif score < 0.70:
        return "#f97316"  # Moderate-High (Orange)
    else:
        return "#ef4444"  # High Risk (Red)

@router.get("/risk")
def get_risk_overlay(
    request: Request,
    time: Literal["day", "night"] = Query("night", description="Time bucket")
):
    """Returns street segments with risk properties for the map overlay."""
    graph = getattr(request.app.state, "graph", None)
    dynamic_penalties = getattr(request.app.state, "dynamic_edge_penalties", {})
    
    if graph is None:
        return {"type": "FeatureCollection", "features": []}

    features = []
    risk_attr = f"risk_{time}"
    
    for u, v, k, data in graph.edges(keys=True, data=True):
        geom = data.get("geometry")
        if geom is None:
            continue
            
        edge_id = f"{u}_{v}_{k}"
        extra_penalty = dynamic_penalties.get(edge_id, 0.0)
        base_risk = data.get(risk_attr, 0.35)
        effective_risk = min(1.0, base_risk + extra_penalty)
        
        # Convert shapely geometry to GeoJSON dict
        import shapely.geometry
        geom_dict = shapely.geometry.mapping(geom)
        
        features.append({
            "type": "Feature",
            "properties": {
                "edge_id": edge_id,
                "name": data.get("name", "Unnamed Street"),
                "risk": round(effective_risk, 3),
                "risk_color": get_risk_color(effective_risk),
                "highway": data.get("highway", "residential"),
                "lit": data.get("lit", "unknown")
            },
            "geometry": geom_dict
        })

    return {"type": "FeatureCollection", "features": features}
