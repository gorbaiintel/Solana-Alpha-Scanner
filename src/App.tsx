import React, { useState, useEffect, useCallback } from 'react';
import {
  HealthStatus,
  SignalEvent,
  TxEvent,
  AppSettings,
  PumpFunToken,
  BinanceTicker,
  ClaudeTradingDecision,
  RealPosition,
  RealExecution,
  BotStateType,
  RealWalletIntelligence,
  RealSwap,
} from './types';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { ActiveSignals } from './components/ActiveSignals';
import { NodePipeline } from './components/NodePipeline';
import { BubbleMap } from './components/BubbleMap';
import { TransactionFeed } from './components/TransactionFeed';
import { SignalsTable } from './components/SignalsTable';
import { RealTradingDesk } from './components/RealTradingDesk';
import { PumpFunScanner } from './components/PumpFunScanner';
import { BinanceTickerFeed } from './components/BinanceTickerFeed';
import { ClaudeTradingLogic } from './components/ClaudeTradingLogic';
import { SmartMoneyProfiler } from './components/SmartMoneyProfiler';
import { FlyHighDesk } from './components/FlyHighDesk';
import { SettingsModal } from './components/SettingsModal';
import { AiExplainModal } from './components/AiExplainModal';
import { SolanaIdModal } from './components/SolanaIdModal';

export default function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [activeSignals, setActiveSignals] = useState<SignalEvent[]>([]);
  const [signals, setSignals] = useState<SignalEvent[]>([]);
  const [events, setEvents] = useState<TxEvent[]>([]);
  const [positions, setPositions] = useState<RealPosition[]>([]);
  const [executions, setExecutions] = useState<RealExecution[]>([]);
  const [botState, setBotState] = useState<BotStateType>('DISABLED');
  const [dailyLossUsd, setDailyLossUsd] = useState<number>(0);
  const [walletBalanceSol, setWalletBalanceSol] = useState<number>(0);
  const [walletBalanceBnb, setWalletBalanceBnb] = useState<number>(0);

  const [pumpTokens, setPumpTokens] = useState<PumpFunToken[]>([]);
  const [binanceTickers, setBinanceTickers] = useState<BinanceTicker[]>([]);
  const [claudeDecisions, setClaudeDecisions] = useState<ClaudeTradingDecision[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [wallets, setWallets] = useState<RealWalletIntelligence[]>([]);
  const [swaps, setSwaps] = useState<RealSwap[]>([]);

  // Solana ID state
  const [connectedWallet, setConnectedWallet] = useState<string | null>(
    localStorage.getItem('solana_id_wallet') || null
  );
  const [solBalance, setSolBalance] = useState<number>(0);
  const [isSolanaIdOpen, setIsSolanaIdOpen] = useState(false);

  // Layout view mode
  const [activeView, setActiveView] = useState<
    'ALL' | 'PUMP' | 'BINANCE' | 'CLAUDE' | 'SMART_MONEY' | 'FLY_HIGH' | 'TRADING'
  >('TRADING');

  // Global CA and token Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [explainSignal, setExplainSignal] = useState<SignalEvent | null>(null);

  // Fetch real SOL balance when wallet connects
  const fetchWalletBalance = useCallback(async (address: string) => {
    try {
      const res = await fetch(`/api/solana/balance?address=${encodeURIComponent(address)}`);
      if (res.ok) {
        const data = await res.json();
        setSolBalance(data.solBalance ?? 0);
      }
    } catch {
      // Ignore silent network failure
    }
  }, []);

  // Fetch state snapshot from backend
  const fetchStateSnapshot = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) return;
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) return;
      const data = await res.json();

      if (data.health) setHealth(data.health);
      if (data.active) setActiveSignals(data.active);
      if (data.signals) setSignals(data.signals);
      if (data.events) setEvents(data.events);
      if (data.positions) setPositions(data.positions);
      if (data.executions) setExecutions(data.executions);
      if (data.botState) setBotState(data.botState);
      if (typeof data.dailyLossUsd === 'number') setDailyLossUsd(data.dailyLossUsd);
      if (typeof data.walletBalanceSol === 'number') setWalletBalanceSol(data.walletBalanceSol);
      if (typeof data.walletBalanceBnb === 'number') setWalletBalanceBnb(data.walletBalanceBnb);
      if (data.pumpTokens) setPumpTokens(data.pumpTokens);
      if (data.binanceTickers) setBinanceTickers(data.binanceTickers);
      if (data.claudeDecisions) setClaudeDecisions(data.claudeDecisions);
      if (data.settings) setSettings(data.settings);
      if (data.wallets) setWallets(data.wallets);
      if (data.swaps) setSwaps(data.swaps);
    } catch {
      // Silently handle transient disconnects
    }
  }, []);

  // Initial load + polling sync
  useEffect(() => {
    fetchStateSnapshot();
    if (connectedWallet) {
      fetchWalletBalance(connectedWallet);
    }

    const timer = setInterval(fetchStateSnapshot, 2500);

    // WebSocket live stream
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${window.location.host}/ws`;
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'snapshot') {
            const p = msg.payload;
            if (p.health) setHealth(p.health);
            if (p.active) setActiveSignals(p.active);
            if (p.signals) setSignals(p.signals);
            if (p.events) setEvents(p.events);
            if (p.positions) setPositions(p.positions);
            if (p.executions) setExecutions(p.executions);
            if (p.botState) setBotState(p.botState);
            if (typeof p.dailyLossUsd === 'number') setDailyLossUsd(p.dailyLossUsd);
            if (typeof p.walletBalanceSol === 'number') setWalletBalanceSol(p.walletBalanceSol);
            if (typeof p.walletBalanceBnb === 'number') setWalletBalanceBnb(p.walletBalanceBnb);
            if (p.pumpTokens) setPumpTokens(p.pumpTokens);
            if (p.binanceTickers) setBinanceTickers(p.binanceTickers);
            if (p.claudeDecisions) setClaudeDecisions(p.claudeDecisions);
          } else if (msg.type === 'pump_token') {
            setPumpTokens((prev) => (Array.isArray(prev) ? [msg.payload, ...prev.slice(0, 99)] : [msg.payload]));
          } else if (msg.type === 'binance_tickers') {
            setBinanceTickers(msg.payload);
          } else if (msg.type === 'claude_decision') {
            setClaudeDecisions((prev) => (Array.isArray(prev) ? [msg.payload, ...prev.slice(0, 99)] : [msg.payload]));
          } else {
            fetchStateSnapshot();
          }
        } catch {}
      };
    } catch {
      // WS connection fallback to polling
    }

    return () => {
      clearInterval(timer);
      if (ws) ws.close();
    };
  }, [fetchStateSnapshot, connectedWallet, fetchWalletBalance]);

  // Handle settings update
  const handleSaveSettings = async (updated: Partial<AppSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        await fetchStateSnapshot();
      }
    } catch (err) {
      console.error('Failed to save settings', err);
    }
  };

  const handleExplainCa = (token: PumpFunToken) => {
    setExplainSignal({
      id: token.id,
      signature: token.signature,
      slot: token.slot,
      time: token.time,
      mints: [token.ca],
      accounts: [token.creator],
      smartMoneyHit: token.kingOfTheHill,
      devWalletHit: true,
      programHit: true,
      earlyActivity: true,
      newTokenActivity: true,
      liquidityUsd: token.marketCapUsd,
      clusterRisk: 12,
      risk: token.bondingCurveProgress >= 85 ? 'LOW' : 'MEDIUM',
      score: Math.min(100, Math.floor(token.bondingCurveProgress * 0.9 + 10)),
      status: 'ACTIVE',
      note: `Pump.fun token ${token.symbol} bonding curve at ${token.bondingCurveProgress}%`,
    });
  };

  // Realized PnL calculated strictly from real executed trades
  const totalRealizedPnlUsd = executions.reduce((acc, exec) => acc + (exec.realizedPnlUsd || 0), 0);

  const filteredActiveSignals = activeSignals.filter((s) => {
    if (!searchTerm) return true;
    const mint = s.mints[0] || '';
    return (
      mint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.signature.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleConnectWallet = (address: string) => {
    setConnectedWallet(address);
    localStorage.setItem('solana_id_wallet', address);
    fetchWalletBalance(address);
  };

  const handleDisconnectWallet = () => {
    setConnectedWallet(null);
    localStorage.removeItem('solana_id_wallet');
    setSolBalance(0);
  };

  const handleBotStateChange = async (newState: BotStateType) => {
    try {
      if (newState === 'KILL_SWITCH') {
        await fetch('/api/bot/kill-switch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'Triggered from Trading Desk' }),
        });
      } else {
        await fetch('/api/bot/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: newState }),
        });
      }
      setBotState(newState);
      await fetchStateSnapshot();
    } catch (err) {
      console.error('Failed to change bot state:', err);
    }
  };

  const handleExecuteOrder = async (orderReq: any) => {
    try {
      const res = await fetch('/api/trade/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderReq),
      });
      const data = await res.json();
      await fetchStateSnapshot();
      return data;
    } catch (err) {
      console.error('Order execution failed:', err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-pink-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        health={health}
        botState={botState}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRefresh={fetchStateSnapshot}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeView={activeView}
        setActiveView={setActiveView}
        connectedWallet={connectedWallet}
        onOpenSolanaIdModal={() => setIsSolanaIdOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 p-4 md:p-6 max-w-[1600px] mx-auto w-full space-y-6">
        {/* Top Key Metrics Bar */}
        <StatsBar
          health={health}
          activeCount={activeSignals.length}
          totalSignalsCount={signals.length}
          totalPnlUsd={totalRealizedPnlUsd}
          openPositionsCount={positions.filter((p) => p.status === 'OPEN').length}
        />

        {/* Real Trading Desk (Execution Router, Positions, Bot Control & History) */}
        {(activeView === 'ALL' || activeView === 'TRADING') && (
          <RealTradingDesk
            positions={positions}
            executions={executions}
            botState={botState}
            dailyLossUsd={dailyLossUsd}
            walletBalanceSol={walletBalanceSol}
            walletBalanceBnb={walletBalanceBnb}
            connectedWallet={connectedWallet}
            onRefresh={fetchStateSnapshot}
            onStateChange={handleBotStateChange}
            onExecuteOrder={handleExecuteOrder}
          />
        )}

        {/* Binance Realtime Macro Price Stream */}
        {(activeView === 'ALL' || activeView === 'BINANCE') && (
          <BinanceTickerFeed tickers={binanceTickers} />
        )}

        {/* Dedicated Realtime Pump.fun Scanner Bar & Cards */}
        {(activeView === 'ALL' || activeView === 'PUMP') && (
          <div className="grid grid-cols-1 gap-6">
            <PumpFunScanner
              tokens={pumpTokens}
              onExplainCa={handleExplainCa}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>
        )}

        {/* Claude Code Automated Trading Logic View */}
        {(activeView === 'ALL' || activeView === 'CLAUDE') && (
          <div className="grid grid-cols-1 gap-6">
            <ClaudeTradingLogic decisions={claudeDecisions} />
          </div>
        )}

        {/* Smart Money Wallet Profiler & Bitquery MCP On-Chain Habit Audit */}
        {(activeView === 'ALL' || activeView === 'SMART_MONEY') && (
          <SmartMoneyProfiler
            connectedWallet={connectedWallet}
            onOpenSolanaIdModal={() => setIsSolanaIdOpen(true)}
            wallets={wallets}
            swaps={swaps}
          />
        )}

        {/* FLY HIGH DESK */}
        {activeView === 'FLY_HIGH' && (
          <FlyHighDesk
            signals={signals}
            realEventsCount={health?.events || 0}
            openPositionsCount={positions.filter((p) => p.status === 'OPEN').length}
            onOpenSolanaId={() => setIsSolanaIdOpen(true)}
            wallets={wallets}
            swaps={swaps}
            health={health}
          />
        )}

        {/* Solana On-Chain Alpha Radar & Pipeline */}
        {(activeView === 'ALL' || activeView === 'PUMP') && (
          <>
            {/* Active Signals & Node Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <ActiveSignals
                  signals={filteredActiveSignals}
                  onExplainSignal={(s) => setExplainSignal(s)}
                />
              </div>
              <div className="lg:col-span-6">
                <NodePipeline />
              </div>
            </div>

            {/* Bubble Map & Transaction Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <BubbleMap />
              </div>
              <div className="lg:col-span-7">
                <TransactionFeed events={events} />
              </div>
            </div>

            {/* Evaluated Signals History */}
            <div className="grid grid-cols-1 gap-6">
              <SignalsTable
                signals={signals}
                onExplainSignal={(s) => setExplainSignal(s)}
              />
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1600px] mx-auto w-full">
        <div>
          Liquidity Intelligence DApp &amp; Smart Money Scanner. Solana Mainnet + BNB Smart Chain Mainnet.
        </div>
        <div className="font-mono text-[10px] text-slate-500">
          Source: Real On-Chain RPC &amp; WebSockets • Real Execution Router Enabled
        </div>
      </footer>

      {/* Modals */}
      {settings && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSave={handleSaveSettings}
        />
      )}

      <AiExplainModal
        signal={explainSignal}
        onClose={() => setExplainSignal(null)}
      />

      <SolanaIdModal
        isOpen={isSolanaIdOpen}
        onClose={() => setIsSolanaIdOpen(false)}
        connectedWallet={connectedWallet}
        solBalance={solBalance}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
      />
    </div>
  );
}
