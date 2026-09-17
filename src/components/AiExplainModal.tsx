import React, { useEffect, useState } from 'react';
import { SignalEvent } from '../types';
import { X, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface AiExplainModalProps {
  signal: SignalEvent | null;
  onClose: () => void;
}

export const AiExplainModal: React.FC<AiExplainModalProps> = ({ signal, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!signal) {
      setExplanation(null);
      setError(null);
      return;
    }

    const fetchExplanation = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signal),
        });

        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }

        const data = await res.json();
        setExplanation(data.text || data.explanation || 'No explanation returned.');
      } catch (err: any) {
        setError(err.message || 'Failed to fetch AI signal explanation.');
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [signal]);

  if (!signal) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Gemini AI Signal Explanation</h2>
              <p className="text-xs text-slate-400 font-mono truncate max-w-[280px]">
                Mint: {signal.mints[0] || 'Unknown'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-xs text-slate-400 font-mono">Evaluating signal evidence with Gemini AI...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-3 text-rose-300 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <div>
              <div className="font-bold mb-0.5">Evaluation Error</div>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Explanation Result */}
        {!loading && explanation && (
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 font-sans leading-relaxed space-y-2 max-h-[360px] overflow-y-auto whitespace-pre-wrap">
            {explanation}
          </div>
        )}

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};
