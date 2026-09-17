import React from 'react';
import { PaperTrade } from '../types';
import { DollarSign, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface PaperTradesTableProps {
  trades: PaperTrade[];
}

export const PaperTradesTable: React.FC<PaperTradesTableProps> = ({ trades }) => {
  const shortMint = (m: string) => (m && typeof m === 'string' && m.length >= 14 ? `${m.slice(0, 8)}…${m.slice(-6)}` : String(m || 'UNKNOWN'));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col h-full shadow-xl">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Simulated Paper Trades
            </h2>
            <p className="text-[11px] text-slate-400">
              Automated paper trading triggered on ACTIVE signals
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
          SIMULATION ONLY
        </span>
      </div>

      <div className="overflow-x-auto flex-1 max-h-[300px] overflow-y-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="sticky top-0 bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
            <tr>
              <th className="py-2 px-3">Side</th>
              <th className="py-2 px-3">Mint</th>
              <th className="py-2 px-3">Entry Size</th>
              <th className="py-2 px-3">Sim Price</th>
              <th className="py-2 px-3">Live P&amp;L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {trades.map((tr) => (
              <tr key={tr.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-2 px-3">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[10px] flex items-center gap-0.5 w-max">
                    <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                    {tr.side}
                  </span>
                </td>
                <td className="py-2 px-3 text-cyan-300 font-bold">{shortMint(tr.mint)}</td>
                <td className="py-2 px-3 text-slate-200">${tr.usd} USD</td>
                <td className="py-2 px-3 text-slate-400">
                  ${tr.price ? tr.price.toFixed(6) : '0.000100'}
                </td>
                <td className="py-2 px-3">
                  <span
                    className={`font-bold ${
                      tr.pnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {tr.pnlUsd >= 0 ? '+' : ''}${tr.pnlUsd.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}

            {trades.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                  No paper trades executed yet. Active signals automatically create paper trades.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
