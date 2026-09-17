import React from 'react';
import { SignalEvent } from '../types';
import { Zap, ShieldAlert, Sparkles, CheckCircle2, Clock, Copy, Check } from 'lucide-react';

interface ActiveSignalsProps {
  signals: SignalEvent[];
  onExplainSignal: (signal: SignalEvent) => void;
}

export const ActiveSignals: React.FC<ActiveSignalsProps> = ({ signals, onExplainSignal }) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyMint = (mint: string, id: string) => {
    navigator.clipboard.writeText(mint);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col h-full shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Active Signal Window
            </h2>
            <p className="text-[11px] text-slate-400">
              Live scanner evaluation (&ge; 70 score &amp; &ge; $2k liquidity)
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800/80 text-emerald-400">
          {signals.length} ACTIVE
        </span>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
        {signals.map((sig) => {
          const mint = sig.mints[0] || 'ALPHA_TOKEN_MINT';

          return (
            <div
              key={sig.id}
              className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 hover:border-emerald-400 transition-all shadow-md group relative"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-extrabold text-cyan-300 truncate">
                      {mint}
                    </span>
                    <button
                      onClick={() => handleCopyMint(mint, sig.id)}
                      className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
                      title="Copy Mint Address"
                    >
                      {copiedId === sig.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(sig.time).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span>Slot #{sig.slot}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="text-2xl font-black font-mono text-emerald-400 leading-none">
                    {sig.score}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                    Score
                  </span>
                </div>
              </div>

              {/* Indicator Chips */}
              <div className="flex flex-wrap items-center gap-1.5 my-3">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                    sig.smartMoneyHit
                      ? 'bg-purple-950/80 border-purple-800 text-purple-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  SMART MONEY {sig.smartMoneyHit ? '✓' : '—'}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                    sig.devWalletHit
                      ? 'bg-cyan-950/80 border-cyan-800 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  DEV CREATOR {sig.devWalletHit ? '✓' : '—'}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                    sig.earlyActivity
                      ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  EARLY BUY {sig.earlyActivity ? '✓' : '—'}
                </span>

                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                    sig.risk === 'LOW'
                      ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                      : sig.risk === 'MEDIUM'
                      ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                      : 'bg-rose-950/80 border-rose-800 text-rose-300'
                  }`}
                >
                  RISK: {sig.risk}
                </span>

                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300 ml-auto">
                  ~${sig.liquidityUsd.toLocaleString()} USD
                </span>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 italic truncate max-w-[200px]">
                  {sig.note}
                </span>

                <button
                  onClick={() => onExplainSignal(sig)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  AI Explain
                </button>
              </div>
            </div>
          );
        })}

        {signals.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs rounded-xl bg-slate-950/40 border border-dashed border-slate-800 my-auto">
            <Zap className="w-6 h-6 text-slate-600 mx-auto mb-2" />
            No active signals meeting active threshold (&ge; 70 score) right now.
            <br />
            Click <strong className="text-emerald-400">"Test Alpha Signal"</strong> in header to trigger one.
          </div>
        )}
      </div>
    </div>
  );
};
