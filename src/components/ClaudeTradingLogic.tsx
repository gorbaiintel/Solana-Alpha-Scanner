import React from 'react';
import { ClaudeTradingDecision } from '../types';
import { Bot, ShieldCheck, Zap, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ClaudeTradingLogicProps {
  decisions: ClaudeTradingDecision[];
}

export const ClaudeTradingLogic: React.FC<ClaudeTradingLogicProps> = ({ decisions }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col h-full shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-slate-950 shadow-md shadow-purple-500/20">
            <Bot className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              CLAUDE CODE TRADING LOGIC ENGINE
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-950 border border-purple-800 text-purple-300">
                AUTO-EVALUATOR ACTIVE
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Deterministic rule evaluation &amp; automated paper execution logic
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-purple-400">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          Rules Active: 4/4
        </div>
      </div>

      {/* Decision Stream List */}
      <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
        {decisions.map((d) => {
          const isBuy = d.action === 'BUY';
          const isTakeProfit = d.action === 'TAKE_PROFIT';
          const isHold = d.action === 'HOLD';
          const isAvoid = d.action === 'AVOID';

          return (
            <div
              key={d.id}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-purple-500/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black font-mono flex items-center gap-1 border ${
                      isBuy
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : isTakeProfit
                        ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                        : isHold
                        ? 'bg-amber-950 text-amber-400 border-amber-800'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {isBuy && <Zap className="w-3 h-3 text-emerald-400" />}
                    {isTakeProfit && <CheckCircle2 className="w-3 h-3 text-cyan-400" />}
                    {isHold && <ArrowUpRight className="w-3 h-3 text-amber-400" />}
                    {isAvoid && <AlertTriangle className="w-3 h-3 text-slate-400" />}
                    {d.action}
                  </span>

                  <span className="font-extrabold font-mono text-xs text-slate-200">
                    ${d.symbol}
                  </span>

                  <span className="text-[10px] font-mono text-slate-500 truncate max-w-[140px]">
                    CA: {d?.ca && typeof d.ca === 'string' ? `${d.ca.slice(0, 8)}...` : 'N/A'}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono font-bold text-purple-400">
                    Confidence: {d.confidence}%
                  </span>
                </div>
              </div>

              <div className="text-[11px] font-medium text-slate-300 mb-1">
                <span className="text-slate-400 font-mono text-[10px]">Rule: </span>
                <span className="font-bold text-purple-300">{d.ruleMatched}</span>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                {d.reasoning}
              </p>
            </div>
          );
        })}

        {decisions.length === 0 && (
          <div className="py-8 text-center text-slate-500 text-xs rounded-xl bg-slate-950/40 border border-dashed border-slate-800">
            Waiting for Claude Code trading decision triggers...
          </div>
        )}
      </div>
    </div>
  );
};
