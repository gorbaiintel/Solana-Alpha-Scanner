import React from 'react';
import { Network, CheckCircle2, Flame, Play, Workflow } from 'lucide-react';

interface NodePipelineProps {
  lastEventTime?: number;
}

export const NodePipeline: React.FC<NodePipelineProps> = ({ lastEventTime }) => {
  const stages = [
    { num: '01', title: 'WS INPUT', desc: 'Solana logs + slot', type: 'ok' },
    { num: '02', title: 'TX FETCH', desc: 'getTransaction', type: 'ok' },
    { num: '03', title: 'PROGRAM ROUTER', desc: 'Launchpad / DEX routing', type: 'ok' },
    { num: '04', title: 'LAUNCH DETECTOR', desc: 'Program-specific decode', type: 'ok' },
    { num: '05', title: 'DEV WALLET', desc: 'Creator activity', type: 'active' },
    { num: '06', title: 'SMART MONEY', desc: 'Wallet hit / history', type: 'active' },
    { num: '07', title: 'EARLY BUY', desc: 'Token-age entry', type: 'ok' },
    { num: '08', title: 'HOLDERS', desc: 'Concentration index', type: 'ok' },
    { num: '09', title: 'BUBBLE MAP', desc: 'Wallet graph', type: 'ok' },
    { num: '10', title: 'LIQUIDITY', desc: 'Pool / liquidity depth', type: 'ok' },
    { num: '11', title: 'MOMENTUM', desc: 'Flow acceleration', type: 'ok' },
    { num: '12', title: 'RISK', desc: 'Rug / authority / cluster', type: 'hot' },
    { num: '13', title: 'SCORE', desc: 'Deterministic 0–100', type: 'hot' },
    { num: '14', title: 'ACTIVE WINDOW', desc: 'TTL + refresh', type: 'hot' },
    { num: '15', title: 'IPAD UI', desc: 'Live dashboard', type: 'ok' },
    { num: '16', title: 'PAPER TRADE', desc: 'Simulation execution', type: 'active' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col h-full shadow-xl">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Workflow className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Deterministic Node Pipeline
            </h2>
            <p className="text-[11px] text-slate-400">
              16-stage pipeline evaluating real-time transaction streams
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
          ALL NODES ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 overflow-y-auto max-h-[380px] pr-1">
        {stages.map((stg) => {
          let cardStyle = 'bg-slate-950 border-slate-800/80 text-slate-300';
          let numStyle = 'text-slate-500';

          if (stg.type === 'hot') {
            cardStyle = 'bg-slate-950 border-cyan-500/50 shadow-md shadow-cyan-500/10';
            numStyle = 'text-cyan-400 font-bold';
          } else if (stg.type === 'active') {
            cardStyle = 'bg-slate-950 border-emerald-500/50 shadow-md shadow-emerald-500/10';
            numStyle = 'text-emerald-400 font-bold';
          }

          return (
            <div
              key={stg.num}
              className={`p-3 rounded-xl border transition-all hover:border-slate-700 flex flex-col justify-between ${cardStyle}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono ${numStyle}`}>
                    {stg.num}
                  </span>
                  {stg.type === 'hot' && (
                    <Flame className="w-3 h-3 text-cyan-400 animate-pulse" />
                  )}
                  {stg.type === 'active' && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  )}
                </div>
                <div className="text-xs font-extrabold text-slate-200 tracking-tight leading-tight">
                  {stg.title}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 mt-2 leading-tight">
                {stg.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
