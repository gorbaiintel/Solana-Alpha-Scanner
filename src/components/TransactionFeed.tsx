import React, { useState } from 'react';
import { TxEvent } from '../types';
import { Activity, Copy, Check, ExternalLink } from 'lucide-react';

interface TransactionFeedProps {
  events: TxEvent[];
}

export const TransactionFeed: React.FC<TransactionFeedProps> = ({ events }) => {
  const [copiedSig, setCopiedSig] = useState<string | null>(null);

  const handleCopySig = (sig: string) => {
    navigator.clipboard.writeText(sig);
    setCopiedSig(sig);
    setTimeout(() => setCopiedSig(null), 2000);
  };

  const shortSig = (s: string) => (s && typeof s === 'string' && s.length >= 14 ? `${s.slice(0, 8)}…${s.slice(-6)}` : String(s || '—'));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col h-full shadow-xl">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Live Scanned Transactions
            </h2>
            <p className="text-[11px] text-slate-400">
              Raw RPC transaction stream evaluated in real-time
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
          {events.length} EVENTS
        </span>
      </div>

      <div className="overflow-x-auto flex-1 max-h-[300px] overflow-y-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="sticky top-0 bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
            <tr>
              <th className="py-2 px-3">Slot</th>
              <th className="py-2 px-3">Signature</th>
              <th className="py-2 px-3">Flags</th>
              <th className="py-2 px-3">Score</th>
              <th className="py-2 px-3">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {events.map((ev, i) => (
              <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-2 px-3 text-cyan-400 font-bold">{ev.slot}</td>
                <td className="py-2 px-3 text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span>{shortSig(ev.signature)}</span>
                    <button
                      onClick={() => handleCopySig(ev.signature)}
                      className="text-slate-500 hover:text-slate-200 p-0.5 rounded"
                      title="Copy Signature"
                    >
                      {copiedSig === ev.signature ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <a
                      href={`https://solscan.io/tx/${ev.signature}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-500 hover:text-cyan-400"
                      title="View on Solscan"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-1 text-[9px]">
                    {ev.smartMoneyHit && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                        SMART
                      </span>
                    )}
                    {ev.devWalletHit && (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                        DEV
                      </span>
                    )}
                    {!ev.smartMoneyHit && !ev.devWalletHit && (
                      <span className="text-slate-600">—</span>
                    )}
                  </div>
                </td>
                <td className="py-2 px-3 font-bold text-slate-100">{ev.score}</td>
                <td className="py-2 px-3">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      ev.risk === 'LOW'
                        ? 'text-emerald-400'
                        : ev.risk === 'MEDIUM'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {ev.risk}
                  </span>
                </td>
              </tr>
            ))}

            {events.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                  Connecting to Solana WebSocket stream...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
