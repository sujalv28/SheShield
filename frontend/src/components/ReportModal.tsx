import React, { useState } from 'react';
import { X, CheckCircle, ShieldAlert } from 'lucide-react';
import { UnsafeReportRequest } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clickedCoords: [number, number] | null; // [lng, lat]
  onSubmitReport: (data: UnsafeReportRequest) => Promise<boolean>;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  clickedCoords,
  onSubmitReport,
}) => {
  const [category, setCategory] = useState<UnsafeReportRequest['category']>('poor_lighting');
  const [notes, setNotes] = useState('');
  const [lat, setLat] = useState(clickedCoords ? clickedCoords[1] : 41.8827);
  const [lng, setLng] = useState(clickedCoords ? clickedCoords[0] : -87.6289);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (clickedCoords) {
      setLng(clickedCoords[0]);
      setLat(clickedCoords[1]);
    }
  }, [clickedCoords]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await onSubmitReport({ lat, lng, category, notes });
    setSubmitting(false);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Report Unsafe Spot</h3>
            <p className="text-xs text-slate-400">Instantly applies an edge penalty to recalculate routes.</p>
          </div>
        </div>

        {success ? (
          <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-5 text-center my-4">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">Report Submitted!</h4>
            <p className="text-xs text-emerald-300 mt-1">
              Nearest road segment penalized in memory. Map overlay updated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Hazard Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="poor_lighting">💡 Broken / Poor Street Lighting</option>
                <option value="harassment">⚠️ Harassment / Suspicious Activity</option>
                <option value="deserted">🏚️ Deserted Alley / Low Visibility</option>
                <option value="hazard">🚧 Construction Obstruction / Chokepoint</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Notes & Context
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe lighting condition, visual obstruction, or safety concern..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex gap-2 justify-end mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40 transition-all flex items-center gap-1.5"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
