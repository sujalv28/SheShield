"""Pydantic schemas for request and response models."""
from typing import Dict, Any, List, Optional, Tuple, Literal
from pydantic import BaseModel, Field

class LatLng(BaseModel):
    lat: float
    lng: float

class WorstSegment(BaseModel):
    coordinates: List[float]  # [lng, lat]
    reason: str

class RouteFactors(BaseModel):
    lighting_score: float = Field(..., description="0-100 score where 100 is best lit")
    safe_haven_proximity: float = Field(..., description="0-100 score for proximity to open shops, transit, police")
    incident_exposure: float = Field(..., description="0-100 score where 0 is safest / least incident density")

class RouteDetail(BaseModel):
    distance_meters: float
    walking_time_minutes: int
    safety_score: float = Field(..., description="0-100 composite safety score")
    geojson: Dict[str, Any]
    worst_segment: Optional[WorstSegment] = None
    factors: RouteFactors

class RouteDelta(BaseModel):
    safety_gain_pct: float
    detour_overhead_pct: float
    extra_minutes: int

class RouteResponse(BaseModel):
    fastest: RouteDetail
    safest: RouteDetail
    delta: RouteDelta

class UnsafeReportCreate(BaseModel):
    lat: float
    lng: float
    category: Literal["poor_lighting", "harassment", "deserted", "hazard"]
    notes: Optional[str] = ""

class UnsafeReportResponse(BaseModel):
    status: str
    affected_edge_id: Optional[str] = None
    new_edge_risk: Optional[float] = None
    message: str

class RiskOverlayResponse(BaseModel):
    type: str = "FeatureCollection"
    features: List[Dict[str, Any]]
