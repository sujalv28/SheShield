import React, { useState } from 'react';
import { X, Upload, CheckCircle, FileText, AlertCircle } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Upload failed');
      }

      setResult(data);
      onUploadSuccess();
    } catch (err: any) {
      setError(err.message || 'Error uploading CSV');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Upload Incident Dataset</h3>
            <p className="text-xs text-slate-500">Ingest a custom CSV dataset to dynamically rescore street safety.</p>
          </div>
        </div>

        {result ? (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 text-center my-4">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-emerald-900">Ingestion Complete!</h4>
            <p className="text-xs text-emerald-700 mt-1">
              Parsed {result.valid_spatial_records} geocoded incidents. Graph risk scores refreshed.
            </p>
            {result.gemma_analysis?.status === 'success' && (
              <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  Gemma Data Analysis
                </p>
                <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
                  {result.gemma_analysis.analysis}
                </p>
              </div>
            )}
            {result.gemma_analysis?.status === 'not_configured' && (
              <p className="mt-3 text-[11px] text-slate-500">
                Gemma analysis is unavailable until the backend API key is configured.
              </p>
            )}
            {result.gemma_analysis?.status === 'error' && (
              <p className="mt-3 text-[11px] text-amber-700">
                CSV ingestion completed, but Gemma analysis was unavailable.
              </p>
            )}
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpload} className="flex flex-col gap-4">
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-400 transition-colors bg-slate-50">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <label className="cursor-pointer">
                <span className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  {file ? file.name : 'Select a CSV file'}
                </span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </label>
              <p className="text-[11px] text-slate-500 mt-1">
                Required columns: <code className="text-slate-700 font-mono bg-slate-200/60 px-1 py-0.5 rounded">latitude, longitude</code>
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2 justify-end mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!file || uploading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-sm transition-all"
              >
                {uploading ? 'Processing...' : 'Upload & Rescore'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
