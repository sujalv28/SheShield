import React from 'react';
import { Shield, Clock, Compass, AlertTriangle, Lightbulb, Building2, Flame } from 'lucide-react';
import { RouteResponse } from '../types';

interface RouteCardProps {
  routeData: RouteResponse | null;
  loading: boolean;
  selectedRoute: 'safest' | 'fastest';
  onSelectRoute: (type: 'safest' | 'fastest') => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  routeData,
  loading,
  selectedRoute,
  onSelectRoute,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-5 shadow-2xl animate-pulse text-slate-300">
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="h-24 bg-slate-700/60 rounded-xl"></div>
          <div className="h-24 bg-slate-700/60 rounded-xl"></div>
        </div>
        <div className="h-10 bg-slate-700/40 rounded-lg"></div>
      </div>
    );
  }

  if (!routeData) {
    return (
      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-5 shadow-2xl text-center text-slate-400">
        <Compass className="w-10 h-10 mx-auto mb-2 text-indigo-400 opacity-80" />
        <p className="text-sm font-medium">Select an origin and destination on the map or pick a demo preset below.</p>
      </div>
    );
  }

  const { fastest, safest, delta } = routeData;

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/70 rounded-2xl p-5 shadow-2xl text-slate-100 flex flex-col gap-4">
      {/* Header & Delta Gain Badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-wide flex items-center gap-2 text-white">
          <Shield className="w-5 h-5 text-emerald-400" />
          Route Comparison
        </h2>
        {delta.safety_gain_pct > 0 && (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            +{delta.safety_gain_pct}% Safer
          </span>
        )}
      </div>

      {/* Side-by-Side Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Safest Route Card */}
        <button
          onClick={() => onSelectRoute('safest')}
          className={`text-left p-3.5 rounded-xl border transition-all ${
            selectedRoute === 'safest'
              ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500'
              : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Safest Route
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              {safest.safety_score}/100
            </span>
          </div>
          <div className="text-xl font-bold text-white mb-0.5">
            {safest.walking_time_minutes} <span className="text-xs font-normal text-slate-400">min</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span>{(safest.distance_meters / 1000).toFixed(2)} km</span>
            {delta.extra_minutes > 0 && (
              <span className="text-amber-400 font-medium">(+{delta.extra_minutes} min detour)</span>
            )}
          </div>
        </button>

        {/* Fastest Route Card */}
        <button
          onClick={() => onSelectRoute('fastest')}
          className={`text-left p-3.5 rounded-xl border transition-all ${
            selectedRoute === 'fastest'
              ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-950/50 ring-1 ring-amber-500'
              : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Fastest Route
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
              {fastest.safety_score}/100
            </span>
          </div>
          <div className="text-xl font-bold text-white mb-0.5">
            {fastest.walking_time_minutes} <span className="text-xs font-normal text-slate-400">min</span>
          </div>
          <div className="text-xs text-slate-400">
            {(fastest.distance_meters / 1000).toFixed(2)} km (direct)
          </div>
        </button>
      </div>

      {/* Worst Segment Alert (if present on fastest route) */}
      {fastest.worst_segment && (
        <div className="bg-rose-950/40 border border-rose-800/50 rounded-xl p-3 text-xs text-rose-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-rose-300">Fastest Route Hazard: </span>
            {fastest.worst_segment.reason}. The Safest Route detours around this stretch.
          </div>
        </div>
      )}

      {/* Factor Breakdown Comparison */}
      <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-3.5 flex flex-col gap-3">
        <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Safety Factor Breakdown ({selectedRoute === 'safest' ? 'Safest' : 'Fastest'})
        </div>

        {/* Lighting Factor */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-400" /> Street Lighting
            </span>
            <span className="font-bold text-slate-200">
              {selectedRoute === 'safest' ? safest.factors.lighting_score : fastest.factors.lighting_score}%
            </span>
          </div>
          <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-yellow-400 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${selectedRoute === 'safest' ? safest.factors.lighting_score : fastest.factors.lighting_score}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Safe Haven / Open POIs */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" /> Open Havens & Transit Proximity
            </span>
            <span className="font-bold text-slate-200">
              {selectedRoute === 'safest' ? safest.factors.safe_haven_proximity : fastest.factors.safe_haven_proximity}%
            </span>
          </div>
          <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cyan-400 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${selectedRoute === 'safest' ? safest.factors.safe_haven_proximity : fastest.factors.safe_haven_proximity}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Incident Exposure (Lower is better) */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> Incident Exposure (Lower = Safer)
            </span>
            <span className="font-bold text-slate-200">
              {selectedRoute === 'safest' ? safest.factors.incident_exposure : fastest.factors.incident_exposure}%
            </span>
          </div>
          <div className="w-full bg-slate-700/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${selectedRoute === 'safest' ? safest.factors.incident_exposure : fastest.factors.incident_exposure}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
