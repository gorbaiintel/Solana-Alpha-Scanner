import React from 'react';
import { HealthStatus } from '../types';
import { Cpu, Activity, Zap, Radio, DollarSign, Layers } from 'lucide-react';

interface StatsBarProps {
  health: HealthStatus | null;
  activeCount: number;
  totalSignalsCount: number;
  totalPnlUsd: number;
  openPositionsCount?: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  health,
  activeCount,
  totalSignalsCount,
  totalPnlUsd,
  openPositionsCount = 0,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {/* Current Solana Slot */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Solana Slot</span>
          <Cpu className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold font-mono text-cyan-400">
          {health?.solanaLastSlot ? health.solanaLastSlot.toLocaleString() : health?.slot ? health.slot.toLocaleString() : 'WAITING'}
        </div>
      </div>

      {/* On-Chain Events Ingested */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Ingested Events</span>
          <Radio className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold font-mono text-slate-100">
          {health?.events ? health.events.toLocaleString() : 0}
        </div>
      </div>

      {/* Active Signals */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 bg-emerald-950/10 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Active Signals</span>
          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold font-mono text-emerald-400">
          {activeCount}
        </div>
      </div>

      {/* Open Real Positions */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Open Positions</span>
          <Layers className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-xl md:text-2xl font-extrabold font-mono text-slate-100">
          {openPositionsCount}
        </div>
      </div>

      {/* Realized P&L */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider">Realized P&amp;L</span>
          <DollarSign className="w-4 h-4 text-emerald-400" />
        </div>
        <div
          className={`text-xl md:text-2xl font-extrabold font-mono ${
            totalPnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {totalPnlUsd >= 0 ? '+' : ''}${totalPnlUsd.toFixed(2)}
        </div>
      </div>
    </div>
  );
};
