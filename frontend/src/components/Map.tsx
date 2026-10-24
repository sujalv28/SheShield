import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { RouteResponse, TimeBucket } from '../types';

interface MapProps {
  timeBucket: TimeBucket;
  routeData: RouteResponse | null;
  selectedRoute: 'safest' | 'fastest';
  showRiskOverlay: boolean;
  origin: [number, number] | null;
  destination: [number, number] | null;
  onSelectPoint: (coords: [number, number], type: 'origin' | 'destination') => void;
  onMapClickForReport: (coords: [number, number]) => void;
  reports: any[];
}

export const Map: React.FC<MapProps> = ({
  timeBucket,
  routeData,
  selectedRoute,
  showRiskOverlay,
  origin,
  destination,
  onSelectPoint,
  onMapClickForReport,
  reports,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const originMarkerRef = useRef<maplibregl.Marker | null>(null);
  const destMarkerRef = useRef<maplibregl.Marker | null>(null);
  const worstMarkerRef = useRef<maplibregl.Marker | null>(null);
  const reportMarkersRef = useRef<maplibregl.Marker[]>([]);

  // Style URL based on time bucket
  const isNight = timeBucket === 'night' || timeBucket === 'evening';
  const tileUrl = isNight
    ? 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
    : 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'carto-tiles': {
            type: 'raster',
            tiles: [tileUrl],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors, &copy; CARTO',
          },
        },
        layers: [
          {
            id: 'carto-layer',
            type: 'raster',
            source: 'carto-tiles',
            minzoom: 0,
            maxzoom: 20,
          },
        ],
      },
      center: [-87.6298, 41.8818], // Chicago The Loop center
      zoom: 14,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', () => {
      // Risk Overlay source & layer
      map.addSource('risk-overlay', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'risk-overlay-layer',
        type: 'line',
        source: 'risk-overlay',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': ['get', 'risk_color'],
          'line-width': 3.5,
          'line-opacity': 0.75,
        },
      });

      // Fastest Route Layer (Amber)
      map.addSource('fastest-route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'fastest-route-layer',
        type: 'line',
        source: 'fastest-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#f59e0b',
          'line-width': 4.5,
          'line-dasharray': [2, 1.5],
          'line-opacity': 0.85,
        },
      });

      // Safest Route Casing (Emerald Glow)
      map.addSource('safest-route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'safest-route-glow',
        type: 'line',
        source: 'safest-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#059669',
          'line-width': 8,
          'line-opacity': 0.4,
          'line-blur': 2,
        },
      });
      map.addLayer({
        id: 'safest-route-layer',
        type: 'line',
        source: 'safest-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#10b981',
          'line-width': 5,
          'line-opacity': 0.95,
        },
      });
    });

    // Map click for point selection or reporting
    map.on('click', (e) => {
      const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      if (e.originalEvent.shiftKey) {
        onMapClickForReport(coords);
      } else {
        // If no origin, set origin; else set destination
        if (!origin) {
          onSelectPoint(coords, 'origin');
        } else if (!destination) {
          onSelectPoint(coords, 'destination');
        } else {
          // Restart origin
          onSelectPoint(coords, 'origin');
        }
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Basemap Tiles when timeBucket changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource('carto-tiles') as maplibregl.RasterTileSource;
    if (source && source.setTiles) {
      source.setTiles([tileUrl]);
    }
  }, [tileUrl]);

  // Update Origin and Destination Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (origin) {
      if (!originMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white';
        el.innerText = 'A';
        originMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat(origin)
          .addTo(map);
      } else {
        originMarkerRef.current.setLngLat(origin);
      }
    } else if (originMarkerRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }

    if (destination) {
      if (!destMarkerRef.current) {
        const el = document.createElement('div');
        el.className = 'w-6 h-6 rounded-full bg-indigo-600 border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white';
        el.innerText = 'B';
        destMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat(destination)
          .addTo(map);
      } else {
        destMarkerRef.current.setLngLat(destination);
      }
    } else if (destMarkerRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }
  }, [origin, destination]);

  // Update line emphasis based on selectedRoute
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('safest-route-layer')) {
      map.setPaintProperty(
        'safest-route-layer',
        'line-opacity',
        selectedRoute === 'safest' ? 1.0 : 0.6
      );
    }
    if (map.getLayer('fastest-route-layer')) {
      map.setPaintProperty(
        'fastest-route-layer',
        'line-opacity',
        selectedRoute === 'fastest' ? 1.0 : 0.6
      );
    }
  }, [selectedRoute]);

  // Update Route Polylines
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const fastestSource = map.getSource('fastest-route') as maplibregl.GeoJSONSource;
    const safestSource = map.getSource('safest-route') as maplibregl.GeoJSONSource;

    if (routeData) {
      if (fastestSource) fastestSource.setData(routeData.fastest.geojson);
      if (safestSource) safestSource.setData(routeData.safest.geojson);

      // Handle worst segment marker
      if (routeData.fastest.worst_segment) {
        const coords = routeData.fastest.worst_segment.coordinates;
        if (!worstMarkerRef.current) {
          const el = document.createElement('div');
          el.className = 'w-5 h-5 rounded-full bg-rose-600 border-2 border-white animate-ping';
          const popup = new maplibregl.Popup({ offset: 12 }).setText(
            `Hazard Alert: ${routeData.fastest.worst_segment.reason}`
          );
          worstMarkerRef.current = new maplibregl.Marker({ element: el })
            .setLngLat(coords as [number, number])
            .setPopup(popup)
            .addTo(map);
        } else {
          worstMarkerRef.current.setLngLat(coords as [number, number]);
        }
      } else if (worstMarkerRef.current) {
        worstMarkerRef.current.remove();
        worstMarkerRef.current = null;
      }

      // Fit bounds to routes
      const coords = [
        ...routeData.fastest.geojson.geometry.coordinates,
        ...routeData.safest.geojson.geometry.coordinates,
      ];
      if (coords.length > 0) {
        const bounds = coords.reduce(
          (b, coord) => b.extend(coord as [number, number]),
          new maplibregl.LngLatBounds(coords[0] as [number, number], coords[0] as [number, number])
        );
        map.fitBounds(bounds, { padding: 80, maxZoom: 16 });
      }
    } else {
      if (fastestSource) fastestSource.setData({ type: 'FeatureCollection', features: [] });
      if (safestSource) safestSource.setData({ type: 'FeatureCollection', features: [] });
      if (worstMarkerRef.current) {
        worstMarkerRef.current.remove();
        worstMarkerRef.current = null;
      }
    }
  }, [routeData]);

  // Update Risk Overlay Visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    map.setLayoutProperty(
      'risk-overlay-layer',
      'visibility',
      showRiskOverlay ? 'visible' : 'none'
    );

    if (showRiskOverlay) {
      // Fetch risk GeoJSON
      fetch(`/api/risk?time=${timeBucket}`)
        .then((res) => res.json())
        .then((data) => {
          const source = map.getSource('risk-overlay') as maplibregl.GeoJSONSource;
          if (source && data.features) {
            source.setData(data);
          }
        })
        .catch((err) => console.error('Failed to load risk overlay', err));
    }
  }, [showRiskOverlay, timeBucket]);

  // Update Crowdsourced Report Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    reportMarkersRef.current.forEach((m) => m.remove());
    reportMarkersRef.current = [];

    reports.forEach((rep) => {
      const el = document.createElement('div');
      el.className = 'w-6 h-6 rounded-full bg-rose-600/80 border-2 border-white shadow flex items-center justify-center text-white text-[10px] font-bold cursor-pointer';
      el.innerText = '!';
      const popup = new maplibregl.Popup({ offset: 10 }).setHTML(
        `<div class="font-bold text-rose-400 text-xs uppercase">${rep.category.replace('_', ' ')}</div><div class="text-xs text-slate-200 mt-1">${rep.notes || 'Unsafe spot report'}</div>`
      );
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([rep.lng, rep.lat])
        .setPopup(popup)
        .addTo(map);
      reportMarkersRef.current.push(marker);
    });
  }, [reports]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute top-4 left-4 z-10 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-3 py-1.5 text-[11px] text-slate-300 shadow-lg pointer-events-none">
        <span className="font-semibold text-white">Hint:</span> Click on map to set Origin (A) and Destination (B). Hold <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-600 rounded text-slate-200">Shift</kbd> + Click to report a hazard.
      </div>
    </div>
  );
};
