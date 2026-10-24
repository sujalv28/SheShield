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
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-5 shadow-xl animate-pulse text-slate-500">
        <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="h-24 bg-slate-100 rounded-xl"></div>
          <div className="h-24 bg-slate-100 rounded-xl"></div>
        </div>
        <div className="h-10 bg-slate-100 rounded-lg"></div>
      </div>
    );
  }

  if (!routeData) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-5 shadow-xl text-center text-slate-500">
        <Compass className="w-10 h-10 mx-auto mb-2 text-indigo-500 opacity-80" />
        <p className="text-sm font-medium text-slate-700">Select origin & destination on the map or choose a demo preset.</p>
      </div>
    );
  }

  const { fastest, safest, delta } = routeData;

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-5 shadow-xl text-slate-800 flex flex-col gap-4">
      {/* Header & Delta Gain Badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold tracking-tight flex items-center gap-2 text-slate-900">
          <Shield className="w-5 h-5 text-emerald-600" />
          Route Comparison
        </h2>
        {delta.safety_gain_pct > 0 && (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
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
              ? 'bg-emerald-50/90 border-emerald-500 shadow-md ring-1 ring-emerald-500'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-700 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Safest
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {safest.safety_score}/100
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mb-0.5">
            {safest.walking_time_minutes} <span className="text-xs font-normal text-slate-500">min</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span>{(safest.distance_meters / 1000).toFixed(2)} km</span>
            {delta.extra_minutes > 0 && (
              <span className="text-amber-600 font-medium">(+{delta.extra_minutes} min)</span>
            )}
          </div>
        </button>

        {/* Fastest Route Card */}
        <button
          onClick={() => onSelectRoute('fastest')}
          className={`text-left p-3.5 rounded-xl border transition-all ${
            selectedRoute === 'fastest'
              ? 'bg-amber-50/90 border-amber-500 shadow-md ring-1 ring-amber-500'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Fastest
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {fastest.safety_score}/100
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mb-0.5">
            {fastest.walking_time_minutes} <span className="text-xs font-normal text-slate-500">min</span>
          </div>
          <div className="text-xs text-slate-500">
            {(fastest.distance_meters / 1000).toFixed(2)} km (direct)
          </div>
        </button>
      </div>

      {/* Hazard Alert on Fastest Route (if any) */}
      {fastest.worst_segment && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-rose-900">Direct Route Risk: </span>
            {fastest.worst_segment.reason}. Safest route steers onto higher visibility avenues.
          </div>
        </div>
      )}

      {/* Factor Breakdown Comparison */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-col gap-3">
        <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          Safety Factor Breakdown ({selectedRoute === 'safest' ? 'Safest Route' : 'Fastest Route'})
        </div>

        {/* Street Visibility / Infrastructure */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Street Visibility & Infrastructure
            </span>
            <span className="font-bold text-slate-900">
              {selectedRoute === 'safest' ? safest.factors.lighting_score : fastest.factors.lighting_score}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${selectedRoute === 'safest' ? safest.factors.lighting_score : fastest.factors.lighting_score}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Active POIs / Safe Havens */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Building2 className="w-3.5 h-3.5 text-cyan-600" /> Safe Havens & Transit Proximity
            </span>
            <span className="font-bold text-slate-900">
              {selectedRoute === 'safest' ? safest.factors.safe_haven_proximity : fastest.factors.safe_haven_proximity}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cyan-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${selectedRoute === 'safest' ? safest.factors.safe_haven_proximity : fastest.factors.safe_haven_proximity}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Incident Exposure (Lower is better) */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Flame className="w-3.5 h-3.5 text-rose-500" /> Incident Exposure (Lower = Safer)
            </span>
            <span className="font-bold text-slate-900">
              {selectedRoute === 'safest' ? safest.factors.incident_exposure : fastest.factors.incident_exposure}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
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
