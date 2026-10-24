import { useState, useEffect } from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { Map } from './components/Map';
import { Controls, DEMO_PRESETS } from './components/Controls';
import { RouteCard } from './components/RouteCard';
import { ReportModal } from './components/ReportModal';
import { UploadModal } from './components/UploadModal';
import { TimeBucket, RouteResponse, DemoPreset, UnsafeReportRequest } from './types';

export default function App() {
  const timeBucket: TimeBucket = 'day';
  const [detourCap, setDetourCap] = useState<number>(0.20);
  const [showRiskOverlay, setShowRiskOverlay] = useState<boolean>(false);
  const [selectedRoute, setSelectedRoute] = useState<'safest' | 'fastest'>('safest');
  
  // Let the user choose a showcase preset or set both points on the map.
  const [origin, setOrigin] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [clickedReportCoords, setClickedReportCoords] = useState<[number, number] | null>(null);
  const [reports, setReports] = useState<any[]>([]);

  // Fetch reports on mount
  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (e) {
      console.warn('Could not load reports', e);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Fetch Route Computation
  const fetchRoute = async () => {
    if (!origin || !destination) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        from_lat: origin[1].toString(),
        from_lng: origin[0].toString(),
        to_lat: destination[1].toString(),
        to_lng: destination[0].toString(),
        time: timeBucket,
        max_detour: detourCap.toString(),
      });

      const selectedPreset = DEMO_PRESETS.find((preset) => preset.id === activePresetId);
      if (selectedPreset) {
        params.set('fastest_path', JSON.stringify(selectedPreset.fastestPath));
        params.set('safest_path', JSON.stringify(selectedPreset.safestPath));
      }

      const res = await fetch(`/api/route?${params.toString()}`);
      if (res.ok) {
        const data: RouteResponse = await res.json();
        setRouteData(data);
      }
    } catch (err) {
      console.error('Error fetching route', err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever origin, destination, timeBucket, or detourCap change
  useEffect(() => {
    fetchRoute();
  }, [origin, destination, timeBucket, detourCap, activePresetId]);

  const handleSelectPreset = (preset: DemoPreset) => {
    setActivePresetId(preset.id);
    setDetourCap(preset.detour);
    setOrigin(preset.from);
    setDestination(preset.to);
  };

  const handleSelectPoint = (coords: [number, number], type: 'origin' | 'destination') => {
    setActivePresetId(null);
    if (type === 'origin') {
      setOrigin(coords);
      setDestination(null);
      setRouteData(null);
    } else {
      setDestination(coords);
    }
  };

  const handleMapClickForReport = (coords: [number, number]) => {
    setClickedReportCoords(coords);
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = async (payload: UnsafeReportRequest): Promise<boolean> => {
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchReports();
        // Re-compute route to take penalty into account
        await fetchRoute();
        return true;
      }
    } catch (e) {
      console.error('Failed to submit report', e);
    }
    return false;
  };

  const handleClearPoints = () => {
    setOrigin(null);
    setDestination(null);
    setRouteData(null);
    setActivePresetId(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <header className="z-20 h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between text-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight">SafePath</span>
            <span className="text-xs text-slate-400 ml-2 font-mono">SheShield</span>
          </div>
          <span className="ml-3 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-slate-800 text-slate-300 border border-slate-700">
            Pilot: Chicago Downtown
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="hidden md:inline-flex items-center gap-1 text-emerald-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Risk-Weighted Navigation
          </span>
          <div className="h-4 w-px bg-slate-700 hidden md:block"></div>
          <span className="text-[11px] text-slate-400">
            Relative risk metrics &middot; OpenStreetMap & Socrata
          </span>
        </div>
      </header>

      {/* Main Map & Floating UI Container */}
      <div className="relative flex-1 w-full h-full">
        {/* Fullscreen Map Canvas */}
        <Map
          routeData={routeData}
          selectedRoute={selectedRoute}
          showRiskOverlay={showRiskOverlay}
          origin={origin}
          destination={destination}
          onSelectPoint={handleSelectPoint}
          onMapClickForReport={handleMapClickForReport}
          reports={reports}
        />

        {/* Floating Sidebar Panels */}
        <div className="absolute top-4 left-4 z-10 w-96 max-h-[calc(100vh-5.5rem)] overflow-y-auto flex flex-col gap-4 pr-1 pointer-events-auto custom-scrollbar">
          {/* Controls: Detour and Demo Showcase Presets */}
          <Controls
            detourCap={detourCap}
            onDetourChange={setDetourCap}
            showRiskOverlay={showRiskOverlay}
            onToggleRiskOverlay={() => setShowRiskOverlay(!showRiskOverlay)}
            onSelectPreset={handleSelectPreset}
            activePresetId={activePresetId}
            onOpenReportModal={() => {
              setClickedReportCoords(null);
              setIsReportModalOpen(true);
            }}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onClearPoints={handleClearPoints}
            hasPoints={origin !== null || destination !== null}
          />

          {/* Route Comparison & Explainability Card */}
          <RouteCard
            routeData={routeData}
            loading={loading}
            selectedRoute={selectedRoute}
            onSelectRoute={setSelectedRoute}
          />
        </div>
      </div>

      {/* Modals */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        clickedCoords={clickedReportCoords}
        onSubmitReport={handleSubmitReport}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => {
          fetchRoute();
        }}
      />
    </div>
  );
}
