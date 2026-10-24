import React from 'react';
import { Sliders, Layers, AlertCircle, Upload, Navigation } from 'lucide-react';
import { DemoPreset } from '../types';

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'loop-river-north',
    name: 'Loop to River North',
    description: 'LaSalle Street corridor to Ontario Street via mapped downtown blocks',
    from: [-87.6327, 41.8797], // W Adams St & S LaSalle St
    to: [-87.6315, 41.8930],   // W Ontario St & N Clark St
    detour: 0.20,
    fastestPath: [
      [-87.6327, 41.8797], // W Adams St & S LaSalle St
      [-87.6327, 41.8838], // W Washington St & S LaSalle St
      [-87.6315, 41.8838], // W Washington St & N Clark St
      [-87.6315, 41.8930], // W Ontario St & N Clark St
    ],
    safestPath: [
      [-87.6327, 41.8797], // W Adams St & S LaSalle St
      [-87.6327, 41.8818], // W Madison St & S LaSalle St
      [-87.6277, 41.8818], // W Madison St & N State St
      [-87.6277, 41.8930], // W Ontario St & N State St
      [-87.6315, 41.8930], // W Ontario St & N Clark St
    ],
  },
  {
    id: 'west-loop-union',
    name: 'West Loop to Union Station',
    description: 'Randolph Street to Adams Street through mapped West Loop corridors',
    from: [-87.6488, 41.8845], // W Randolph St & N Halsted St
    to: [-87.6395, 41.8795],   // W Adams St & S Canal St
    detour: 0.15,
    fastestPath: [
      [-87.6488, 41.8845], // W Randolph St & N Halsted St
      [-87.6488, 41.8795], // W Adams St & N Halsted St
      [-87.6395, 41.8795], // W Adams St & S Canal St
    ],
    safestPath: [
      [-87.6488, 41.8845], // W Randolph St & N Halsted St
      [-87.6440, 41.8845], // W Randolph St & N Ogden Ave
      [-87.6440, 41.8795], // W Adams St & N Ogden Ave
      [-87.6395, 41.8795], // W Adams St & S Canal St
    ],
  },
  {
    id: 'millennium-mag-mile',
    name: 'Millennium Park to Mag Mile',
    description: 'Michigan Avenue corridor from Randolph Street to Huron Street',
    from: [-87.6244, 41.8840], // E Randolph St & N Michigan Ave
    to: [-87.6246, 41.8955],   // E Huron St & N Michigan Ave
    detour: 0.10,
    fastestPath: [
      [-87.6244, 41.8840], // E Randolph St & N Michigan Ave
      [-87.6245, 41.8955], // E Huron St & N Michigan Ave
    ],
    safestPath: [
      [-87.6244, 41.8840], // E Randolph St & N Michigan Ave
      [-87.6260, 41.8840], // E Randolph St & N Wabash Ave
      [-87.6260, 41.8955], // E Huron St & N Wabash Ave
      [-87.6246, 41.8955], // E Huron St & N Michigan Ave
    ],
  },
];

interface ControlsProps {
  detourCap: number;
  onDetourChange: (cap: number) => void;
  showRiskOverlay: boolean;
  onToggleRiskOverlay: () => void;
  onSelectPreset: (preset: DemoPreset) => void;
  activePresetId: string | null;
  onOpenReportModal: () => void;
  onOpenUploadModal: () => void;
  onClearPoints: () => void;
  hasPoints: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  detourCap,
  onDetourChange,
  showRiskOverlay,
  onToggleRiskOverlay,
  onSelectPreset,
  activePresetId,
  onOpenReportModal,
  onOpenUploadModal,
  onClearPoints,
  hasPoints,
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-5 shadow-xl text-slate-800 flex flex-col gap-4">
      {/* Detour Allowance Slider */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-600" /> Detour Limit
          </label>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            +{Math.round(detourCap * 100)}% Max Detour
          </span>
        </div>
        <input
          type="range"
          min="0.05"
          max="0.50"
          step="0.05"
          value={detourCap}
          onChange={(e) => onDetourChange(parseFloat(e.target.value))}
          className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>+5% Direct</span>
          <span>+25% Balanced</span>
          <span>+50% Max Safety</span>
        </div>
      </div>

      {/* Demo Scenario Presets */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2 block">
          Demo Showcase Presets
        </label>
        <div className="flex flex-col gap-2">
          {DEMO_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p)}
              className={`text-left px-3 py-2.5 rounded-xl text-xs border transition-all ${
                activePresetId === p.id
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-medium ring-1 ring-emerald-500 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="font-semibold flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-emerald-600" /> {p.name}
              </div>
              <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{p.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Layer Toggles & Action Buttons */}
      <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" /> Street Risk Overlay
          </span>
          <button
            onClick={onToggleRiskOverlay}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              showRiskOverlay ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                showRiskOverlay ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            onClick={onOpenReportModal}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-all shadow-sm"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Report Hazard
          </button>
          <button
            onClick={onOpenUploadModal}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-all shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" /> Upload CSV
          </button>
        </div>

        {hasPoints && (
          <button
            onClick={onClearPoints}
            className="text-[11px] text-slate-400 hover:text-slate-600 text-center py-1 transition-colors"
          >
            Clear Selected Route Pins
          </button>
        )}
      </div>
    </div>
  );
};
