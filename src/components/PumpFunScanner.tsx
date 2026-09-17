import React, { useState } from 'react';
import { PumpFunToken } from '../types';
import {
  Flame,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Search,
  Filter,
  Zap,
  Crown,
  CheckCircle,
} from 'lucide-react';

interface PumpFunScannerProps {
  tokens: PumpFunToken[];
  onExplainCa: (token: PumpFunToken) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const PumpFunScanner: React.FC<PumpFunScannerProps> = ({
  tokens,
  onExplainCa,
  searchTerm,
  setSearchTerm,
}) => {
  const [copiedCa, setCopiedCa] = useState<string | null>(null);
  const [progressFilter, setProgressFilter] = useState<number>(0);

  const handleCopy = (ca: string) => {
    navigator.clipboard.writeText(ca);
    setCopiedCa(ca);
    setTimeout(() => setCopiedCa(null), 2000);
  };

  const filteredTokens = tokens.filter((t) => {
    const matchesSearch =
      !searchTerm ||
      t.ca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.symbol.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = t.bondingCurveProgress >= progressFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col h-full shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-pink-500 to-amber-500 text-slate-950 shadow-md shadow-pink-500/20">
            <Flame className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              REALTIME PUMP.FUN SCANNER
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-pink-950/80 border border-pink-800 text-pink-300">
                LIVE BONDING CURVE
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Contract Address (CA) tracker &amp; bonding curve progress stream
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Source: pumpportal.fun WS</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
        {/* Search input */}
        <div className="relative w-full sm:flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Contract Address (CA), Name, or Symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: 'All', val: 0 },
            { label: '50%+', val: 50 },
            { label: '👑 85%+', val: 85 },
            { label: '🎓 100%', val: 100 },
          ].map((f) => (
            <button
              key={f.val}
              onClick={() => setProgressFilter(f.val)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-colors whitespace-nowrap border ${
                progressFilter === f.val
                  ? 'bg-pink-950 border-pink-700 text-pink-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Cards Stream */}
      <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1">
        {filteredTokens.map((token) => (
          <div
            key={token.id}
            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-pink-500/50 transition-all shadow-md group"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-extrabold text-sm text-slate-100 truncate">
                    {token.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-pink-400">
                    ${token.symbol}
                  </span>

                  {token.kingOfTheHill && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 text-[9px] font-bold flex items-center gap-0.5">
                      <Crown className="w-3 h-3 text-amber-400" />
                      KING OF HILL
                    </span>
                  )}

                  {token.graduatedRaydium && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-[9px] font-bold flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      RAYDIUM GRADUATED
                    </span>
                  )}
                </div>

                {/* Contract Address (CA) Row */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono font-semibold text-slate-400">CA:</span>
                  <span className="text-[11px] font-mono font-bold text-cyan-300 truncate max-w-[220px] sm:max-w-[320px]">
                    {token.ca}
                  </span>
                  <button
                    onClick={() => handleCopy(token.ca)}
                    className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/80 text-cyan-300 text-[10px] font-mono font-bold flex items-center gap-1 transition-all active:scale-95 shrink-0"
                    title="Copy Contract Address"
                  >
                    {copiedCa === token.ca ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy CA
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-base font-extrabold font-mono text-slate-100">
                  ${token.marketCapUsd.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400 font-medium uppercase">Market Cap</span>
              </div>
            </div>

            {/* Bonding Curve Progress Bar */}
            <div className="my-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-slate-400">Bonding Curve Progress:</span>
                <span
                  className={`font-bold ${
                    token.bondingCurveProgress >= 85
                      ? 'text-emerald-400'
                      : token.bondingCurveProgress >= 50
                      ? 'text-amber-400'
                      : 'text-pink-400'
                  }`}
                >
                  {token.bondingCurveProgress.toFixed(1)}%
                </span>
              </div>

              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    token.bondingCurveProgress >= 85
                      ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                      : token.bondingCurveProgress >= 50
                      ? 'bg-gradient-to-r from-pink-500 to-amber-400'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}
                  style={{ width: `${Math.min(100, token.bondingCurveProgress)}%` }}
                />
              </div>
            </div>

            {/* Footer Action Bar */}
            <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
              <div className="text-slate-400">
                Sol: <span className="text-slate-200 font-bold">{token.solAmount} SOL</span>
                <span className="mx-1.5">•</span>
                Replies: <span className="text-slate-200 font-bold">{token.replyCount}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href={token.pumpFunUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-0.5 rounded bg-pink-950/80 hover:bg-pink-900 border border-pink-800/80 text-pink-300 font-bold flex items-center gap-1 transition-colors"
                >
                  Pump.fun
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>

                <a
                  href={token.dexScreenerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold flex items-center gap-1 transition-colors"
                >
                  DexScreener
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>

                <button
                  onClick={() =>
                    onExplainCa({
                      ...token,
                    })
                  }
                  className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/80 text-cyan-300 font-bold flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                  AI Audit CA
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredTokens.length === 0 && (
          <div className="py-10 px-4 text-center text-slate-400 text-xs rounded-xl bg-slate-950/60 border border-dashed border-slate-800/80 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-950/60 border border-pink-800/60 flex items-center justify-center text-pink-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-slate-200 text-sm mb-1">
                No Pump.fun coins found
              </p>
              <p className="text-slate-400 max-w-sm mx-auto text-[11px]">
                We didn't find any tokens matching <span className="text-pink-400 font-mono font-bold">"{searchTerm || 'filter'}"</span>.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold font-mono text-xs shadow-md shadow-pink-500/20 transition-all active:scale-95"
                >
                  Clear Search Filter
                </button>
              )}
              {progressFilter > 0 && (
                <button
                  onClick={() => setProgressFilter(0)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold font-mono text-xs transition-colors"
                >
                  Reset Progress Filter
                </button>
              )}
            </div>

            {/* Quick Filter Suggestions */}
            <div className="pt-2 flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
              <span>Quick Search:</span>
              {['SOL', 'PEPE', 'PUMP', 'AI', 'DOGE'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-pink-500 hover:text-pink-300 transition-colors"
                >
                  ${tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
