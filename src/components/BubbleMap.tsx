import React from 'react';
import { Share2, Network, ShieldCheck, UserCheck } from 'lucide-react';

export const BubbleMap: React.FC = () => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col h-full shadow-xl">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Bubble Map / Wallet Cluster Graph
            </h2>
            <p className="text-[11px] text-slate-400">
              Holder distribution &amp; wallet relationship clustering
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
          LOW CLUSTER RISK
        </span>
      </div>

      <div className="relative w-full h-[260px] bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
        {/* SVG Network Edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="edgeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="edgeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Lines connecting central TOKEN node to surrounding wallets */}
          <line x1="50%" y1="50%" x2="22%" y2="28%" stroke="url(#edgeGrad1)" strokeWidth="2" strokeDasharray="4 2" className="animate-pulse" />
          <line x1="50%" y1="50%" x2="78%" y2="28%" stroke="url(#edgeGrad2)" strokeWidth="2" />
          <line x1="50%" y1="50%" x2="28%" y2="76%" stroke="url(#edgeGrad1)" strokeWidth="1.5" />
          <line x1="50%" y1="50%" x2="72%" y2="76%" stroke="url(#edgeGrad2)" strokeWidth="1.5" />
          <line x1="22%" y1="28%" x2="28%" y2="76%" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="78%" y1="28%" x2="72%" y2="76%" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
        </svg>

        {/* Central Token Node */}
        <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-cyan-900 to-purple-900 border-2 border-cyan-400 flex flex-col items-center justify-center shadow-lg shadow-cyan-500/20 z-10 cursor-pointer hover:scale-105 transition-transform">
          <span className="text-[11px] font-black text-cyan-200">TOKEN</span>
          <span className="text-[9px] font-mono text-cyan-400">MINT</span>
        </div>

        {/* Dev Wallet Node */}
        <div className="absolute left-[22%] top-[28%] -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-slate-900 border border-purple-500 flex flex-col items-center justify-center text-[10px] font-bold text-purple-300 shadow-md">
          <span>DEV</span>
          <span className="text-[8px] font-mono text-slate-400">0.8%</span>
        </div>

        {/* Smart Money 1 Node */}
        <div className="absolute left-[78%] top-[28%] -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-slate-900 border border-emerald-500 flex flex-col items-center justify-center text-[10px] font-bold text-emerald-300 shadow-md">
          <span>SMART</span>
          <span className="text-[8px] font-mono text-slate-400">2.1%</span>
        </div>

        {/* Trader W1 Node */}
        <div className="absolute left-[28%] top-[76%] -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-[9px] font-semibold text-slate-300">
          <span>W1</span>
          <span className="text-[8px] font-mono text-slate-500">0.5%</span>
        </div>

        {/* Trader W2 Node */}
        <div className="absolute left-[72%] top-[76%] -translate-x-1/2 -translate-y-1/2 w-13 h-13 rounded-full bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-[9px] font-semibold text-slate-300">
          <span>W2</span>
          <span className="text-[8px] font-mono text-slate-500">0.6%</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span> Dev Creator
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Smart Money
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span> Mint
          </span>
        </div>
        <span>Cluster: 12% Clean</span>
      </div>
    </div>
  );
};
