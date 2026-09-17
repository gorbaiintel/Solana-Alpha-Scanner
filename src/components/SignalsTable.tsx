import React, { useState } from 'react';
import { SignalEvent } from '../types';
import { Radio, Sparkles, Copy, Check } from 'lucide-react';

interface SignalsTableProps {
  signals: SignalEvent[];
  onExplainSignal: (signal: SignalEvent) => void;
}

export const SignalsTable: React.FC<SignalsTableProps> = ({ signals, onExplainSignal }) => {
  const [copiedMint, setCopiedMint] = useState<string | null>(null);

  const handleCopyMint = (mint: string) => {
    navigator.clipboard.writeText(mint);
    setCopiedMint(mint);
    setTimeout(() => setCopiedMint(null), 2000);
  };

  const shortMint = (m: string) => (m && typeof m === 'string' && m.length >= 14 ? `${m.slice(0, 8)}…${m.slice(-6)}` : String(m || 'UNKNOWN'));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col h-full shadow-xl">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Evaluated Signals History
            </h2>
            <p className="text-[11px] text-slate-400">
              Historical record of ACTIVE &amp; WATCH signals
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
          {signals.length} SIGNALS
        </span>
      </div>

      <div className="overflow-x-auto flex-1 max-h-[300px] overflow-y-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="sticky top-0 bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
            <tr>
              <th className="py-2 px-3">Time</th>
              <th className="py-2 px-3">Mint Address</th>
              <th className="py-2 px-3">Score</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {signals.map((sig) => {
              const mint = sig.mints[0] || 'ALPHA_MINT';

              return (
                <tr key={sig.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 text-slate-400">
                    {new Date(sig.time).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-3 text-cyan-300">
                    <div className="flex items-center gap-1.5">
                      <span>{shortMint(mint)}</span>
                      <button
                        onClick={() => handleCopyMint(mint)}
                        className="text-slate-500 hover:text-slate-200 p-0.5 rounded"
                        title="Copy Mint"
                      >
                        {copiedMint === mint ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-2 px-3 font-bold text-slate-100">{sig.score}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        sig.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : sig.status === 'WATCH'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {sig.status}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => onExplainSignal(sig)}
                      className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      Explain
                    </button>
                  </td>
                </tr>
              );
            })}

            {signals.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                  No signals recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
