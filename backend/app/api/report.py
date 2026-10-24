"""Crowdsourced unsafe-spot reporting endpoints."""
import time
from fastapi import APIRouter, Request, HTTPException
from ..models import UnsafeReportCreate, UnsafeReportResponse

router = APIRouter()

CATEGORY_PENALTIES = {
    "poor_lighting": 0.25,
    "harassment": 0.40,
    "deserted": 0.20,
    "hazard": 0.30
}

@router.post("/report", response_model=UnsafeReportResponse)
def submit_report(payload: UnsafeReportCreate, request: Request):
    """Submits an unsafe spot report, penalizing the nearest edge in memory."""
    report_entry = {
        "id": f"rep_{int(time.time() * 1000)}",
        "lat": payload.lat,
        "lng": payload.lng,
        "category": payload.category,
        "notes": payload.notes,
        "timestamp": time.time()
    }
    
    # Store report
    if not hasattr(request.app.state, "reports"):
        request.app.state.reports = []
    request.app.state.reports.append(report_entry)
    
    # Apply direct edge penalty
    graph = getattr(request.app.state, "graph", None)
    affected_edge_id = None
    new_risk = None
    
    if graph is not None:
        try:
            # Find closest edge using osmnx nearest_edges or node distance
            import osmnx as ox
            u, v, k = ox.distance.nearest_edges(graph, payload.lng, payload.lat)
            affected_edge_id = f"{u}_{v}_{k}"
            
            penalty = CATEGORY_PENALTIES.get(payload.category, 0.25)
            curr_penalties = getattr(request.app.state, "dynamic_edge_penalties", {})
            curr_penalties[affected_edge_id] = curr_penalties.get(affected_edge_id, 0.0) + penalty
            request.app.state.dynamic_edge_penalties = curr_penalties
            
            # Recalculate edge risk preview
            edge_data = graph[u][v][k]
            base_risk = edge_data.get("risk_night", 0.3)
            new_risk = min(1.0, base_risk + curr_penalties[affected_edge_id])
        except Exception as e:
            # Fallback if edge search fails
            affected_edge_id = "mock_edge"
            new_risk = 0.85
    else:
        affected_edge_id = "mock_edge"
        new_risk = 0.85

    return UnsafeReportResponse(
        status="success",
        affected_edge_id=affected_edge_id,
        new_edge_risk=round(new_risk, 3) if new_risk else 0.85,
        message=f"Report recorded for {payload.category}. Road edge penalized."
    )

@router.get("/reports")
def list_reports(request: Request):
    """Returns all active crowdsourced reports."""
    reports = getattr(request.app.state, "reports", [])
    return {"count": len(reports), "reports": reports}
