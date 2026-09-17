import React, { useState } from 'react';
import { RealPosition, RealExecutionReceipt, BotStateType, ChainType } from '../types';
import { ShieldAlert, Zap, Power, AlertTriangle, ExternalLink, Activity, ArrowUpRight, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

interface RealTradingDeskProps {
  positions: RealPosition[];
  executions: RealExecutionReceipt[];
  botState: BotStateType;
  dailyLossUsd: number;
  walletBalanceSol: number | null;
  walletBalanceBnb: number | null;
  selectedAddress?: string;
  connectedWallet?: string | null;
  onRefresh?: () => void;
  onStateChange?: (state: BotStateType) => void;
  onExecuteOrder?: (req: any) => Promise<any>;
}

export const RealTradingDesk: React.FC<RealTradingDeskProps> = ({
  positions,
  executions,
  botState,
  dailyLossUsd,
  walletBalanceSol,
  walletBalanceBnb,
  selectedAddress,
  connectedWallet,
  onRefresh,
  onStateChange,
  onExecuteOrder,
}) => {
  const [targetToken, setTargetToken] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [chain, setChain] = useState<ChainType>('SOLANA');
  const [amountUsd, setAmountUsd] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastActionResult, setLastActionResult] = useState<string | null>(null);

  const activePositions = positions.filter((p) => p.state !== 'CLOSED');
  const closedPositions = positions.filter((p) => p.state === 'CLOSED');

  const totalUnrealizedPnl = activePositions.reduce((acc, p) => acc + p.unrealizedPnlUsd, 0);
  const totalRealizedPnl = closedPositions.reduce((acc, p) => acc + p.realizedPnlUsd, 0);

  const safeBotStateChange = (nextState: BotStateType) => {
    if (typeof onStateChange === 'function') {
      try {
        onStateChange(nextState);
      } catch (err) {
        console.error('Failed to execute onStateChange:', err);
      }
    }
  };

  const handleManualTrade = async (side: 'BUY' | 'SELL') => {
    if (!targetToken) {
      setLastActionResult('Please specify token contract address');
      return;
    }
    if (!onExecuteOrder) {
      setLastActionResult('Execution router offline');
      return;
    }
    setIsSubmitting(true);
    setLastActionResult(null);
    try {
      const res = await onExecuteOrder({
        chain,
        walletAddress: selectedAddress || connectedWallet || 'REAL_OPERATOR_WALLET',
        tokenAddress: targetToken,
        tokenSymbol: tokenSymbol || 'TOKEN',
        side,
        amountUsd,
        userAuthorized: true,
      });
      if (res.success) {
        setLastActionResult(`Order filled: ${res.txHash}`);
      } else {
        setLastActionResult(`Error: ${res.error || 'Execution rejected'}`);
      }
    } catch (err: any) {
      setLastActionResult(`Execution failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const shortAddr = (str: string) => (str && typeof str === 'string' && str.length >= 10 ? `${str.slice(0, 6)}…${str.slice(-4)}` : String(str || 'UNKNOWN'));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-6">
      {/* Top Header & Autonomous Bot Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Activity className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                Production Execution Desk &amp; Position Manager
              </h2>
              <p className="text-xs text-slate-400">
                Direct RPC/DEX order routing with real on-chain confirmation &amp; verified fills
              </p>
            </div>
          </div>
        </div>

        {/* Bot Mode Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Bot State:</span>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                botState === 'ARMED' || botState === 'RUNNING'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : botState === 'KILL_SWITCH'
                  ? 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {botState}
            </span>
          </div>

          <button
            onClick={() => safeBotStateChange(botState === 'ARMED' ? 'DISABLED' : 'ARMED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              botState === 'ARMED'
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {botState === 'ARMED' ? 'DISARM BOT' : 'ARM BOT'}
          </button>

          <button
            onClick={() => safeBotStateChange('KILL_SWITCH')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1.5 shadow-lg shadow-rose-950/40"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            KILL SWITCH
          </button>
        </div>
      </div>

      {/* Metrics Row: Real Balances, Daily PnL & Risk Limits */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 uppercase font-mono text-[10px]">Real Solana Balance</span>
          <p className="text-base font-bold font-mono text-cyan-400 mt-1">
            {walletBalanceSol !== null ? `${walletBalanceSol.toFixed(4)} SOL` : 'DATA SOURCE OFFLINE'}
          </p>
        </div>
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 uppercase font-mono text-[10px]">Real BNB Balance</span>
          <p className="text-base font-bold font-mono text-amber-400 mt-1">
            {walletBalanceBnb !== null ? `${walletBalanceBnb.toFixed(4)} BNB` : 'DATA SOURCE OFFLINE'}
          </p>
        </div>
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 uppercase font-mono text-[10px]">Open Positions P&amp;L</span>
          <p
            className={`text-base font-bold font-mono mt-1 ${
              totalUnrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            ${totalUnrealizedPnl.toFixed(2)} USD
          </p>
        </div>
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 uppercase font-mono text-[10px]">Daily Realized P&amp;L</span>
          <p
            className={`text-base font-bold font-mono mt-1 ${
              totalRealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            ${totalRealizedPnl.toFixed(2)} USD
          </p>
        </div>
      </div>

      {/* Manual Order Router */}
      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Real Transaction Execution Router
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Router: Jupiter (Solana) / PancakeSwap (BNB)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
          <select
            value={chain}
            onChange={(e) => setChain(e.target.value as ChainType)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
          >
            <option value="SOLANA">Solana Mainnet</option>
            <option value="BNB">BNB Smart Chain</option>
          </select>

          <input
            type="text"
            placeholder="Contract Address (Mint/CA)"
            value={targetToken}
            onChange={(e) => setTargetToken(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono"
          />

          <input
            type="text"
            placeholder="Symbol (e.g. BONK, PEPE)"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
          />

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Size (USD)"
              value={amountUsd}
              onChange={(e) => setAmountUsd(Number(e.target.value))}
              className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono"
            />
            <button
              onClick={() => handleManualTrade('BUY')}
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg px-3 py-1.5 transition disabled:opacity-50"
            >
              BUY
            </button>
            <button
              onClick={() => handleManualTrade('SELL')}
              disabled={isSubmitting}
              className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg px-3 py-1.5 transition disabled:opacity-50"
            >
              SELL
            </button>
          </div>
        </div>

        {lastActionResult && (
          <div className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300">
            {lastActionResult}
          </div>
        )}
      </div>

      {/* Active Positions Table */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Real Active Positions ({activePositions.length})
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">
            Protection: Adaptive TP1/TP2/TP3 + Trailing Stop
          </span>
        </div>

        {activePositions.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs font-mono">
            NO OPEN POSITIONS • WAITING FOR REAL DATA OR EXECUTION
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Token</th>
                  <th className="py-2.5 px-3">Chain</th>
                  <th className="py-2.5 px-3">Entry Fill</th>
                  <th className="py-2.5 px-3">Current</th>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3">Protection Stop</th>
                  <th className="py-2.5 px-3">Unrealized P&amp;L</th>
                  <th className="py-2.5 px-3">Tx Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {activePositions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-cyan-300 font-bold">
                      {pos.tokenSymbol || shortAddr(pos.tokenAddress)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{pos.chain}</td>
                    <td className="py-2.5 px-3 text-slate-300">${pos.entryFillPrice.toFixed(6)}</td>
                    <td className="py-2.5 px-3 text-slate-100">${pos.currentPrice.toFixed(6)}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 text-[10px]">
                        {pos.state}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-rose-400">
                      ${pos.trailingStopPrice.toFixed(6)}
                    </td>
                    <td
                      className={`py-2.5 px-3 font-bold ${
                        pos.unrealizedPnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      ${pos.unrealizedPnlUsd.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3">
                      {pos.explorerUrl ? (
                        <a
                          href={pos.explorerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          {shortAddr(pos.entryTxHash)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-500">{shortAddr(pos.entryTxHash)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Execution History */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Real Executions Log ({executions.length})
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">
            Every transaction verified against block hash
          </span>
        </div>

        {executions.length === 0 ? (
          <div className="text-center py-5 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs font-mono">
            NO EXECUTIONS RECORDED YET • WAITING FOR REAL ON-CHAIN FILL
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-56 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="sticky top-0 bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Time</th>
                  <th className="py-2 px-3">Chain</th>
                  <th className="py-2 px-3">Route</th>
                  <th className="py-2 px-3">Size USD</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Explorer Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {executions.map((exec) => (
                  <tr key={exec.id} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 text-slate-400">
                      {new Date(exec.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-3 text-slate-300">{exec.chain}</td>
                    <td className="py-2 px-3 text-amber-300">{exec.route}</td>
                    <td className="py-2 px-3 text-slate-200">${exec.amountIn}</td>
                    <td className="py-2 px-3">
                      <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                        <CheckCircle className="w-3 h-3" /> {exec.status}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <a
                        href={exec.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        {shortAddr(exec.txHash)}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
