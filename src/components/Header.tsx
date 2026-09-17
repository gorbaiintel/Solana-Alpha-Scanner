import React from 'react';
import { HealthStatus, BotStateType } from '../types';
import {
  Zap,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  Search,
  Tablet,
  LayoutGrid,
  Bot,
  Globe,
  Shield,
  Wallet,
  FileDown,
  BrainCircuit,
  Crosshair,
  Activity,
  Cpu,
} from 'lucide-react';

interface HeaderProps {
  health: HealthStatus | null;
  botState?: BotStateType;
  onOpenSettings: () => void;
  onRefresh: () => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  activeView: 'ALL' | 'PUMP' | 'BINANCE' | 'CLAUDE' | 'SMART_MONEY' | 'FLY_HIGH' | 'TRADING';
  setActiveView: (view: 'ALL' | 'PUMP' | 'BINANCE' | 'CLAUDE' | 'SMART_MONEY' | 'FLY_HIGH' | 'TRADING') => void;
  connectedWallet: string | null;
  onOpenSolanaIdModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  botState = 'DISABLED',
  onOpenSettings,
  onRefresh,
  searchTerm,
  setSearchTerm,
  activeView,
  setActiveView,
  connectedWallet,
  onOpenSolanaIdModal,
}) => {
  const isConnected = health?.connected ?? false;

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 py-2.5 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-pink-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-sm md:text-base font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
              LIQUIDITY INTELLIGENCE <span className="text-cyan-400">DAPP</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-pink-950/80 border border-pink-800 text-pink-300 hidden md:inline-flex items-center gap-1">
                <Flame className="w-3 h-3 text-pink-400" />
                SOLANA + BNB MAINNET
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Real-time on-chain mempool, DEX liquidity analytics &amp; smart money intelligence
            </p>
          </div>
        </div>

        {/* Quick CA Search Input */}
        <div className="hidden lg:flex items-center relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3" />
          <input
            type="text"
            placeholder="Filter CA / Mint..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>

        {/* Live Status & Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Real Slot & Latency Telemetry */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono">
            <span className="text-slate-400">Slot:</span>
            <span className="text-cyan-300 font-bold">
              {health?.solanaLastSlot ? health.solanaLastSlot.toLocaleString() : 'WAITING'}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">BNB:</span>
            <span className="text-amber-300 font-bold">
              {health?.bnbLastBlock ? health.bnbLastBlock.toLocaleString() : 'WAITING'}
            </span>
          </div>

          {/* Connection Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isConnected ? 'bg-emerald-400' : 'bg-rose-500'
                }`}
              ></span>
            </span>
            <span className={isConnected ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
              {isConnected ? 'LIVE MAINNET' : 'DATA SOURCE OFFLINE'}
            </span>
          </div>

          {/* Solana ID Connect Button */}
          <button
            onClick={onOpenSolanaIdModal}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all shrink-0 ${
              connectedWallet
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80 hover:bg-cyan-900'
                : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-slate-950 hover:opacity-90 shadow-md shadow-cyan-500/20'
            }`}
            title="Connect Solana ID Wallet (solana.com/id)"
          >
            {connectedWallet ? (
              <>
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  ID: {typeof connectedWallet === 'string' && connectedWallet.length >= 8
                    ? `${connectedWallet.slice(0, 4)}...${connectedWallet.slice(-4)}`
                    : String(connectedWallet)}
                </span>
              </>
            ) : (
              <>
                <Wallet className="w-3.5 h-3.5 text-slate-950" />
                <span>Connect Solana ID</span>
              </>
            )}
          </button>

          {/* Manual Refresh */}
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors shrink-0"
            title="Refresh Data Snapshot"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Download UI Spec */}
          <a
            href="/api/download-ui-guide"
            download="UI_DESIGN_SYSTEM.md"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-cyan-400 text-slate-300 transition-colors shrink-0 flex items-center gap-1.5 text-xs font-mono"
            title="Download UI Design System (.md)"
          >
            <FileDown className="w-4 h-4 text-cyan-400" />
            <span className="hidden xl:inline">UI Spec (.md)</span>
          </a>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors shrink-0"
            title="Scanner Settings & Thresholds"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Multi-Market Layout Switcher Bar */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1 mr-1 uppercase">
            <Tablet className="w-3.5 h-3.5 text-cyan-400" />
            Displays:
          </span>

          <button
            onClick={() => setActiveView('TRADING')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              activeView === 'TRADING'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-emerald-400 border border-slate-800 hover:text-emerald-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            TRADING DESK
          </button>

          <button
            onClick={() => setActiveView('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              activeView === 'ALL'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            All Markets
          </button>

          <button
            onClick={() => setActiveView('PUMP')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              activeView === 'PUMP'
                ? 'bg-pink-500 text-slate-950 shadow-md shadow-pink-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Pump CA Desk
          </button>

          <button
            onClick={() => setActiveView('BINANCE')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              activeView === 'BINANCE'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Binance Macro
          </button>

          <button
            onClick={() => setActiveView('CLAUDE')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              activeView === 'CLAUDE'
                ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            Claude Engine
          </button>

          <button
            onClick={() => setActiveView('SMART_MONEY')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              activeView === 'SMART_MONEY'
                ? 'bg-gradient-to-r from-purple-500 to-cyan-400 text-slate-950 shadow-md shadow-purple-500/20'
                : 'bg-slate-900 text-purple-300 border border-purple-900/60 hover:border-purple-600 hover:text-purple-200'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            Smart Money
          </button>

          <button
            onClick={() => setActiveView('FLY_HIGH')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-black tracking-wide flex items-center gap-1.5 transition-all ${
              activeView === 'FLY_HIGH'
                ? 'bg-lime-400 text-slate-950 shadow-lg shadow-lime-500/30'
                : 'bg-slate-900 text-lime-400 border border-lime-800/80 hover:border-lime-500 hover:bg-slate-800'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            FLY HIGH DESK
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-500">
          <span>Source: Solana RPC, PumpPortal WS &amp; BSC RPC</span>
        </div>
      </div>
    </header>
  );
};
