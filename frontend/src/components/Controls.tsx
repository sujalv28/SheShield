import React from 'react';
import { Sun, Moon, Sliders, Layers, AlertCircle, Upload, Navigation } from 'lucide-react';
import { TimeBucket, DemoPreset } from '../types';

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'loop-river-north',
    name: 'Loop to River North (Late Night)',
    description: 'Avoids poorly lit alleyways and chokepoints along Wells St at 11 PM',
    from: [-87.6324, 41.8789], // Willis Tower area
    to: [-87.6278, 41.8925],   // River North dining district
    time: 'night',
    detour: 0.20,
  },
  {
    id: 'west-loop-union',
    name: 'West Loop to Union Station (Night Commute)',
    description: 'Routes via lit corridors with open restaurants and active footfall',
    from: [-87.6482, 41.8845], // Fulton Market / West Loop
    to: [-87.6403, 41.8787],   // Union Station
    time: 'night',
    detour: 0.15,
  },
  {
    id: 'millennium-mag-mile',
    name: 'Millennium Park to Mag Mile',
    description: 'Prioritizes high-visibility avenues and Michigan Ave safe havens',
    from: [-87.6226, 41.8826], // Millennium Park Bean
    to: [-87.6243, 41.8988],   // Magnificent Mile
    time: 'night',
    detour: 0.10,
  },
];

interface ControlsProps {
  timeBucket: TimeBucket;
  onTimeChange: (time: TimeBucket) => void;
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
  timeBucket,
  onTimeChange,
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
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/70 rounded-2xl p-5 shadow-2xl text-slate-100 flex flex-col gap-4">
      {/* Time-of-Day Selector */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
          Time of Day
        </label>
        <div className="grid grid-cols-2 gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => onTimeChange('day')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              timeBucket === 'day'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" /> Day Mode
          </button>
          <button
            onClick={() => onTimeChange('night')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              timeBucket === 'night'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-4 h-4 text-purple-400" /> Night Mode
          </button>
        </div>
      </div>

      {/* Detour Allowance Slider */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Detour Limit
          </label>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md">
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
          className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>+5% Direct</span>
          <span>+25% Balanced</span>
          <span>+50% Max Safety</span>
        </div>
      </div>

      {/* Demo Scenario Presets */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
          Pitch Demo Presets
        </label>
        <div className="flex flex-col gap-1.5">
          {DEMO_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p)}
              className={`text-left px-3 py-2 rounded-xl text-xs border transition-all ${
                activePresetId === p.id
                  ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-200 font-medium ring-1 ring-emerald-500/40'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="font-semibold flex items-center gap-1.5">
                <Navigation className="w-3 h-3 text-emerald-400" /> {p.name}
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{p.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Layer Toggles & Action Buttons */}
      <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Street Risk Overlay
          </span>
          <button
            onClick={onToggleRiskOverlay}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              showRiskOverlay ? 'bg-emerald-500' : 'bg-slate-700'
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
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30 transition-all"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Report Hazard
          </button>
          <button
            onClick={onOpenUploadModal}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" /> Upload CSV
          </button>
        </div>

        {hasPoints && (
          <button
            onClick={onClearPoints}
            className="text-[11px] text-slate-500 hover:text-slate-400 text-center py-1 transition-colors"
          >
            Clear Selected Route Pins
          </button>
        )}
      </div>
    </div>
  );
};
