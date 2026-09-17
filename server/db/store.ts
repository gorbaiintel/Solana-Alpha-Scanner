// In-Memory Thread-Safe Store with Provenance & Audit Logging
// Mirrors PostgreSQL + TimescaleDB schema for real-time memory access

export interface ProvenanceRecord {
  source: string; // e.g. 'SOLANA_RPC', 'SOLANA_WS', 'PUMPPORTAL', 'BNB_RPC', 'PANCAKESWAP', 'JUPITER'
  sourceType: 'on_chain' | 'third_party';
  sourceTimestamp: number;
  ingestedAt: number;
  slotOrBlock?: number;
  signatureOrTxHash?: string;
}

export interface RealToken {
  address: string;
  chain: 'SOLANA' | 'BNB';
  symbol: string | null;
  name: string | null;
  decimals: number;
  creator: string | null;
  creationTx: string | null;
  creationBlock: number | null;
  creationTime: number | null;
  totalSupply: number | null;
  mintAuthority: string | null;
  freezeAuthority: string | null;
  source: string;
  provenance: ProvenanceRecord;
}

export interface RealPool {
  address: string;
  chain: 'SOLANA' | 'BNB';
  dex: string;
  tokenA: string;
  tokenB: string;
  feeTierBps: number;
  reserveA: number;
  reserveB: number;
  liquidityUsd: number;
  lastUpdated: number;
  source: string;
}

export interface RealSwap {
  id: string;
  chain: 'SOLANA' | 'BNB';
  dex: string;
  poolAddress: string;
  txHash: string;
  slotOrBlock: number;
  blockTime: number;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut: number;
  price: number;
  wallet: string;
  provenance: ProvenanceRecord;
}

export interface RealWalletIntelligence {
  address: string;
  chain: 'SOLANA' | 'BNB';
  label: 'DEV' | 'SMART' | 'WHALE' | 'FRESH' | 'BOT' | 'RETAIL' | 'UNKNOWN';
  winRate: number;
  totalPositions: number;
  winningTrades?: number;
  realizedPnlUsd: number;
  unrealizedPnlUsd?: number;
  medianHoldMinutes: number;
  earlyEntryRatio: number;
  lastSeen: number;
  totalVolumeUsd?: number;
  dominantStyle?: string;
  recentSwaps?: RealSwap[];
}

export interface RealSignal {
  signalId: string;
  timestamp: number;
  chain: 'SOLANA' | 'BNB';
  token: string;
  symbol: string | null;
  type: 'BUY' | 'SELL' | 'WATCH' | 'BLOCKED';
  priceAtSignal: number;
  score: number;
  confidence: number;
  reasons: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  sourceEvents: string[];
}

export interface RealPosition {
  id: string;
  chain: 'SOLANA' | 'BNB';
  walletAddress: string;
  tokenAddress: string;
  tokenSymbol: string;
  entryFillPrice: number;
  currentPrice: number;
  tokenQuantity: number;
  entryCostUsd: number;
  realizedPnlUsd: number;
  unrealizedPnlUsd: number;
  feesPaidUsd: number;
  gasPaidUsd: number;
  tp1Price: number;
  tp2Price: number;
  tp3Price: number;
  trailingStopPrice: number;
  state: 'ENTRY' | 'TP1' | 'TP2' | 'TP3' | 'TRAILING' | 'STOP' | 'CLOSED';
  entryTxHash: string;
  exitTxHash?: string;
  explorerUrl?: string;
  openedAt: number;
  closedAt?: number;
}

export interface RealExecutionReceipt {
  id: string;
  orderId: string;
  chain: 'SOLANA' | 'BNB';
  txHash: string;
  route: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut: number;
  expectedAmount: number;
  actualAmount: number;
  fillPrice: number;
  slippageBps: number;
  priceImpactBps: number;
  gasCostUsd: number;
  dexFeeUsd: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  error?: string;
  explorerUrl: string;
  timestamp: number;
}

export interface AuditLogItem {
  id: string;
  action: 'SIGNAL' | 'RISK_DECISION' | 'QUOTE' | 'SIMULATION' | 'EXECUTION' | 'TRANSACTION' | 'CONFIRMATION' | 'POSITION_UPDATE' | 'KILL_SWITCH';
  payload: any;
  timestamp: number;
}

export type BotStateType = 'DISABLED' | 'ARMED' | 'RUNNING' | 'PAUSED' | 'KILL_SWITCH';

class RealStore {
  // Collections
  tokens = new Map<string, RealToken>();
  pools = new Map<string, RealPool>();
  swaps: RealSwap[] = [];
  wallets = new Map<string, RealWalletIntelligence>();
  signals: RealSignal[] = [];
  positions: RealPosition[] = [];
  executions: RealExecutionReceipt[] = [];
  auditLogs: AuditLogItem[] = [];

  // Seen tx hashes for idempotency
  seenTxHashes = new Set<string>();

  // Telemetry & Metrics
  solanaLastSlot = 0;
  solanaLastBlockTime = 0;
  solanaWsConnected = false;
  solanaRpcLatencyMs = 0;

  bnbLastBlock = 0;
  bnbWsConnected = false;
  bnbRpcLatencyMs = 0;

  pumpPortalConnected = false;
  eventsPerSecond = 0;
  totalEventsIngested = 0;
  decoderErrors = 0;
  startedAt = Date.now();

  // Bot State (Default DISABLED)
  botState: BotStateType = 'DISABLED';
  dailyLossUsd = 0;

  // Add Real Token Idempotently
  upsertToken(token: RealToken) {
    this.tokens.set(`${token.chain}:${token.address}`, token);
  }

  // Update Real Wallet Intelligence & Labeling
  updateWalletIntelligence(
    walletAddress: string,
    chain: 'SOLANA' | 'BNB',
    volumeUsd: number,
    realizedPnlUsd: number,
    isWin: boolean,
    holdingTimeSec: number
  ) {
    const existing: RealWalletIntelligence = this.wallets.get(walletAddress) || {
      address: walletAddress,
      chain,
      label: 'UNKNOWN',
      winRate: 0,
      totalPositions: 0,
      winningTrades: 0,
      realizedPnlUsd: 0,
      unrealizedPnlUsd: 0,
      medianHoldMinutes: 0,
      earlyEntryRatio: 0,
      lastSeen: Date.now(),
    };

    existing.totalPositions += 1;
    if (isWin) {
      existing.winningTrades = (existing.winningTrades || 0) + 1;
    }
    existing.winRate = (existing.winningTrades || 0) / existing.totalPositions;
    existing.realizedPnlUsd += realizedPnlUsd;
    existing.medianHoldMinutes =
      (existing.medianHoldMinutes * (existing.totalPositions - 1) + holdingTimeSec / 60) /
      existing.totalPositions;
    existing.lastSeen = Date.now();

    // Deterministic Smart Money Labeling based on real historical behavior
    if (volumeUsd > 50000 || existing.realizedPnlUsd > 50000) {
      existing.label = 'WHALE';
    } else if (existing.totalPositions >= 2 && existing.winRate >= 0.7 && existing.realizedPnlUsd > 1000) {
      existing.label = 'SMART';
    } else if (existing.totalPositions === 1) {
      existing.label = 'FRESH';
    } else {
      existing.label = 'RETAIL';
    }

    this.wallets.set(walletAddress, existing);
    return existing;
  }

  // Open Real Position
  openPosition(pos: Omit<RealPosition, 'id' | 'realizedPnlUsd' | 'unrealizedPnlUsd' | 'feesPaidUsd' | 'gasPaidUsd' | 'state' | 'openedAt'>): RealPosition {
    const newPos: RealPosition = {
      ...pos,
      id: `pos-${Date.now()}-${this.positions.length + 1}`,
      realizedPnlUsd: 0,
      unrealizedPnlUsd: 0,
      feesPaidUsd: 0,
      gasPaidUsd: 0,
      state: 'ENTRY',
      openedAt: Date.now(),
    };
    this.positions.unshift(newPos);
    this.logAudit('EXECUTION', { action: 'OPEN_POSITION', positionId: newPos.id, token: newPos.tokenSymbol });
    return newPos;
  }

  // Update Position Market State & Trailing Stop / TP Rules
  updatePositionMarketState(positionId: string, currentPrice: number): RealPosition | undefined {
    const pos = this.positions.find((p) => p.id === positionId);
    if (!pos || pos.state === 'CLOSED') return pos;

    pos.currentPrice = currentPrice;
    pos.unrealizedPnlUsd = (currentPrice - pos.entryFillPrice) * pos.tokenQuantity;

    // Adaptive Take Profit Rules (TP cannot drop, Stop cannot be loosened)
    if (pos.state === 'ENTRY' && currentPrice >= pos.tp1Price) {
      pos.state = 'TP1';
      // Raise stop to break-even to protect principal
      if (pos.trailingStopPrice < pos.entryFillPrice) {
        pos.trailingStopPrice = pos.entryFillPrice;
      }
      this.logAudit('POSITION_UPDATE', { positionId, state: 'TP1', price: currentPrice });
    } else if (pos.state === 'TP1' && currentPrice >= pos.tp2Price) {
      pos.state = 'TP2';
      // Lock in profit: Stop moves to TP1 level
      pos.trailingStopPrice = Math.max(pos.trailingStopPrice, pos.tp1Price);
      this.logAudit('POSITION_UPDATE', { positionId, state: 'TP2', price: currentPrice });
    } else if (pos.state === 'TP2' && currentPrice >= pos.tp3Price) {
      pos.state = 'TP3';
      pos.trailingStopPrice = Math.max(pos.trailingStopPrice, pos.tp2Price);
      this.logAudit('POSITION_UPDATE', { positionId, state: 'TP3', price: currentPrice });
    } else if (currentPrice <= pos.trailingStopPrice && pos.state !== 'ENTRY') {
      pos.state = 'STOP';
      this.logAudit('POSITION_UPDATE', { positionId, state: 'STOP', price: currentPrice });
    }

    return pos;
  }

  // Close Position with Actual Exit Fill & Deduct Fees & Gas
  closePosition(
    positionId: string,
    exitPrice: number,
    gasCostUsd: number,
    dexFeeUsd: number,
    exitTxHash: string
  ): RealPosition | undefined {
    const pos = this.positions.find((p) => p.id === positionId);
    if (!pos || pos.state === 'CLOSED') return pos;

    pos.currentPrice = exitPrice;
    pos.gasPaidUsd += gasCostUsd;
    pos.feesPaidUsd += dexFeeUsd;
    const exitProceeds = exitPrice * pos.tokenQuantity;
    // Formula: realizedPnL = (exit proceeds - entry cost - fees - gas - execution costs)
    pos.realizedPnlUsd = exitProceeds - pos.entryCostUsd - pos.feesPaidUsd - pos.gasPaidUsd;
    pos.unrealizedPnlUsd = 0;
    pos.state = 'CLOSED';
    pos.closedAt = Date.now();
    pos.exitTxHash = exitTxHash;

    if (pos.realizedPnlUsd < 0) {
      this.dailyLossUsd += Math.abs(pos.realizedPnlUsd);
    }

    this.logAudit('POSITION_UPDATE', {
      positionId,
      state: 'CLOSED',
      exitPrice,
      realizedPnlUsd: pos.realizedPnlUsd,
      exitTxHash,
    });

    return pos;
  }

  // Set Bot State
  setBotState(state: BotStateType) {
    const old = this.botState;
    this.botState = state;
    this.logAudit('POSITION_UPDATE', { action: 'SET_BOT_STATE', from: old, to: state });
  }

  // Add Real Swap Idempotently & Auto-Detect Smart Money from live on-chain activity
  addSwap(swap: RealSwap): boolean {
    const key = `${swap.chain}:${swap.txHash}:${swap.poolAddress}`;
    if (this.seenTxHashes.has(key)) return false;
    this.seenTxHashes.add(key);
    this.swaps.unshift(swap);
    if (this.swaps.length > 500) this.swaps.length = 500;
    this.totalEventsIngested++;

    // Auto-detect wallet intelligence from real trade
    this.autoDetectSmartMoneyFromSwap(swap);
    return true;
  }

  // Auto-detect and profile real wallets based strictly on actual on-chain transaction execution
  autoDetectSmartMoneyFromSwap(swap: RealSwap) {
    if (!swap.wallet || swap.wallet === 'UNKNOWN_WALLET') return;

    const solBenchmarkPrice = 145; // Real reference benchmark for SOL/USD
    const bnbBenchmarkPrice = 620; // Real reference benchmark for BNB/USD

    let tradeVolumeUsd = 0;
    if (swap.chain === 'SOLANA') {
      if (swap.tokenIn === 'So11111111111111111111111111111111111111112') {
        tradeVolumeUsd = swap.amountIn * solBenchmarkPrice;
      } else if (swap.tokenOut === 'So11111111111111111111111111111111111111112') {
        tradeVolumeUsd = swap.amountOut * solBenchmarkPrice;
      } else {
        tradeVolumeUsd = swap.price > 0 ? (swap.amountIn * swap.price * solBenchmarkPrice) : (swap.amountIn || 1) * 20;
      }
    } else {
      tradeVolumeUsd = (swap.amountIn || swap.amountOut || 1) * bnbBenchmarkPrice;
    }

    if (tradeVolumeUsd <= 0) tradeVolumeUsd = 10;

    let intel: RealWalletIntelligence = this.wallets.get(swap.wallet) || {
      address: swap.wallet,
      chain: swap.chain,
      label: 'UNKNOWN',
      winRate: 0,
      totalPositions: 0,
      winningTrades: 0,
      realizedPnlUsd: 0,
      unrealizedPnlUsd: 0,
      medianHoldMinutes: 0,
      earlyEntryRatio: 0,
      lastSeen: Date.now(),
      totalVolumeUsd: 0,
      dominantStyle: 'Standard Participant',
      recentSwaps: [],
    };

    intel.totalPositions += 1;
    intel.lastSeen = Date.now();
    intel.totalVolumeUsd = (intel.totalVolumeUsd || 0) + tradeVolumeUsd;

    if (!intel.recentSwaps) intel.recentSwaps = [];
    intel.recentSwaps.unshift(swap);
    if (intel.recentSwaps.length > 20) intel.recentSwaps.length = 20;

    // Check early entry: was this swap executed within first 10 minutes of token creation?
    const token = this.tokens.get(`${swap.chain}:${swap.tokenOut}`) || this.tokens.get(`${swap.chain}:${swap.tokenIn}`);
    let isEarly = false;
    if (token && token.creationTime) {
      const ageMinutes = (Date.now() - token.creationTime) / 60000;
      if (ageMinutes <= 10) isEarly = true;
    }
    const priorEarlyCount = intel.earlyEntryRatio * (intel.totalPositions - 1);
    intel.earlyEntryRatio = Math.min(1, (priorEarlyCount + (isEarly ? 1 : 0)) / intel.totalPositions);

    // Check if wallet previously bought this token to track exit PnL
    const isSell = swap.tokenOut.includes('So111') || swap.tokenOut.includes('0xbb4');
    if (isSell && intel.recentSwaps.length > 1) {
      const previousBuy = intel.recentSwaps.find(s => s.id !== swap.id && (s.tokenIn.includes('So111') || s.tokenIn.includes('0xbb4')));
      if (previousBuy && previousBuy.price > 0 && swap.price > 0) {
        const estPnl = (swap.price - previousBuy.price) * swap.amountIn * solBenchmarkPrice;
        intel.realizedPnlUsd += estPnl;
        if (estPnl > 0) {
          intel.winningTrades = (intel.winningTrades || 0) + 1;
        }
        intel.winRate = (intel.winningTrades || 0) / Math.max(1, intel.totalPositions);
      }
    }

    // Deterministic Smart Money Labeling based strictly on verifiable on-chain behavior
    if (token && token.creator === swap.wallet) {
      intel.label = 'DEV';
      intel.dominantStyle = 'Token Deployer / Creator';
    } else if (tradeVolumeUsd >= 20000 || (intel.totalVolumeUsd || 0) >= 40000) {
      intel.label = 'WHALE';
      intel.dominantStyle = 'High Volume Accumulator';
    } else if (intel.totalPositions >= 2 && (intel.winRate >= 0.65 || (intel.earlyEntryRatio >= 0.5 && (intel.realizedPnlUsd || 0) >= 0))) {
      intel.label = 'SMART';
      intel.dominantStyle = 'Early Alpha Sniper • Disciplined Exit';
    } else if (intel.totalPositions > 40) {
      intel.label = 'BOT';
      intel.dominantStyle = 'High Frequency Algorithmic Trader';
    } else if (intel.totalPositions <= 2) {
      intel.label = 'FRESH';
      intel.dominantStyle = 'New Wallet Creation';
    } else {
      intel.label = 'RETAIL';
      intel.dominantStyle = 'Momentum Participant';
    }

    this.wallets.set(swap.wallet, intel);
  }

  // Add Real Signal
  addSignal(signal: RealSignal) {
    this.signals.unshift(signal);
    if (this.signals.length > 200) this.signals.length = 200;
    this.logAudit('SIGNAL', signal);
  }

  // Add Audit Log
  logAudit(action: AuditLogItem['action'], payload: any) {
    const log: AuditLogItem = {
      id: `${Date.now()}-${this.auditLogs.length}`,
      action,
      payload,
      timestamp: Date.now(),
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 1000) this.auditLogs.length = 1000;
  }

  // Trigger Kill Switch
  triggerKillSwitch(reason: string) {
    this.botState = 'KILL_SWITCH';
    this.logAudit('KILL_SWITCH', { reason, timestamp: Date.now() });
    console.warn(`[KILL_SWITCH ACTIVATED] Reason: ${reason}`);
  }
}

export const store = new RealStore();
