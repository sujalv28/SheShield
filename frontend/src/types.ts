export type TimeBucket = 'day' | 'night';

export interface RouteFactors {
  lighting_score: number;
  safe_haven_proximity: number;
  incident_exposure: number;
}

export interface WorstSegment {
  coordinates: [number, number];
  reason: string;
}

export interface RouteDetail {
  distance_meters: number;
  walking_time_minutes: number;
  safety_score: number;
  geojson: GeoJSON.Feature<GeoJSON.LineString>;
  worst_segment: WorstSegment | null;
  factors: RouteFactors;
}

export interface RouteResponse {
  fastest: RouteDetail;
  safest: RouteDetail;
  delta: {
    safety_gain_pct: number;
    detour_overhead_pct: number;
    extra_minutes: number;
  };
}

export interface UnsafeReportRequest {
  lat: number;
  lng: number;
  category: 'poor_lighting' | 'harassment' | 'deserted' | 'hazard';
  notes: string;
}

export interface DemoPreset {
  id: string;
  name: string;
  description: string;
  from: [number, number]; // [lng, lat]
  to: [number, number];   // [lng, lat]
  time: TimeBucket;
  detour: number;
}
