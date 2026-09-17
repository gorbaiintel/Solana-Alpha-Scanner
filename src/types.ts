export type ChainType = 'SOLANA' | 'BNB';

export type BotStateType = 'DISABLED' | 'ARMED' | 'RUNNING' | 'PAUSED' | 'KILL_SWITCH';

export interface HealthStatus {
  connected: boolean;
  solanaWsConnected?: boolean;
  solanaLastSlot?: number;
  solanaRpcLatencyMs?: number;
  bnbLastBlock?: number;
  bnbRpcLatencyMs?: number;
  pumpPortalConnected?: boolean;
  eventsPerSec?: number;
  totalEvents?: number;
  decoderErrors?: number;
  uptimeSec: number;
  botState?: BotStateType;
  dailyLossUsd?: number;
  slot?: number;
  events?: number;
  signals?: number;
  activeScore?: number;
  pumpTokenCount?: number;
}

export interface RealToken {
  address: string;
  chain: ChainType;
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
  provenance: {
    source: string;
    sourceType: 'on_chain' | 'third_party';
    sourceTimestamp: number;
    ingestedAt: number;
    slotOrBlock?: number;
    signatureOrTxHash?: string;
  };
}

export interface RealSwap {
  id: string;
  chain: ChainType;
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
}

export interface RealWalletIntelligence {
  address: string;
  chain: ChainType;
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

export interface SignalEvent {
  id: string;
  signature: string;
  slot: number;
  time: number;
  blockTime?: number | null;
  mints: string[];
  accounts: string[];
  smartMoneyHit: boolean;
  devWalletHit: boolean;
  programHit: boolean;
  earlyActivity: boolean;
  newTokenActivity: boolean;
  liquidityUsd: number;
  clusterRisk: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  score: number;
  status: 'ACTIVE' | 'WATCH' | 'IGNORE';
  note: string;
}

export interface RealSignal {
  signalId: string;
  timestamp: number;
  chain: ChainType;
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
  chain: ChainType;
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
  chain: ChainType;
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

export interface FlapStatus {
  status: 'FLAP_ADAPTER_NOT_CONFIGURED' | 'READY';
  factoryAddress: string | null;
  routerAddress: string | null;
  poolFactoryAddress: string | null;
  eventTopicsConfigured: boolean;
  message: string;
}

export interface PumpFunToken {
  id: string;
  ca: string;
  name: string;
  symbol: string;
  creator: string;
  marketCapUsd: number;
  bondingCurveProgress: number;
  virtualSolReserves: number;
  virtualTokenReserves: number;
  solAmount: number;
  time: number;
  slot: number;
  signature: string;
  replyCount: number;
  kingOfTheHill: boolean;
  graduatedRaydium: boolean;
  pumpFunUrl: string;
  dexScreenerUrl: string;
  solscanUrl: string;
}

export interface BinanceTicker {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  lastUpdated: number;
}

export interface AppSettings {
  activeScore: number;
  maxSignalAgeSec: number;
  executionMode: 'PAPER' | 'LIVE';
  autotradeEnabled: boolean;
  maxPositionUsd: number;
  maxDailyLossUsd: number;
  maxOpenPositions: number;
  solanaRpcUrl: string;
  solanaWsUrl: string;
  bnbRpcUrl: string;
  bnbWsUrl: string;
}

export interface PositionAudit {
  token: string;
  symbol: string;
  ca: string;
  entryAgeMinutes: number;
  entrySizeUsd: number;
  entryTime: number;
  exitTime?: number;
  holdDurationMinutes: number;
  exitStyle: 'ONE_SHOT_DUMP' | 'STAGGERED_EXIT' | 'HOLDING';
  pnlUsd: number;
  roiPercent: number;
  isWin: boolean;
}

export interface WalletProfile {
  address: string;
  label: string;
  type: 'SMART_MONEY' | 'USER_WALLET' | 'WHALE' | 'DEV' | 'FRESH' | 'BOT';
  totalPositions30d: number;
  winRate: number;
  realizedPnlUsd: number;
  medianHoldTimeMinutes: number;
  avgEntryFreshnessMinutes: number;
  positionSizingStyle: 'STRICT_FIXED' | 'DISCIPLINED' | 'ERRATIC_ROGUE';
  dominantExitStyle: 'STAGGERED_EXIT' | 'ONE_SHOT_DUMP' | 'ROUND_TRIP';
  winningTraits: string[];
  losingTraits: string[];
  positions: PositionAudit[];
}

export interface CostlyHabit {
  rank: number;
  title: string;
  description: string;
  dollarsLost: number;
  frequency: number;
  remedy: string;
  name?: string;
  count?: number;
  totalLossUsd?: number;
  impact?: 'HIGH' | 'MEDIUM' | 'CRITICAL';
  recommendation?: string;
}

export interface TxEvent {
  id: string;
  signature: string;
  tokenSymbol: string;
  tokenAddress: string;
  chain: ChainType;
  type: 'BUY' | 'SELL' | 'ADD_LIQ' | 'REMOVE_LIQ' | 'CREATE_POOL';
  amountUsd: number;
  priceUsd: number;
  timestamp: number;
  traderAddress: string;
}

export interface ClaudeTradingDecision {
  action: 'BUY' | 'SELL' | 'HOLD' | 'KILL_SWITCH';
  confidence: number;
  tokenSymbol: string;
  tokenAddress: string;
  suggestedSizeUsd: number;
  targetPrice?: number;
  stopPrice?: number;
  reasoning: string;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
}

export interface RealExecution {
  id: string;
  txHash: string;
  chain: ChainType;
  dex: string;
  route: string;
  tokenSymbol: string;
  tokenAddress: string;
  side: 'BUY' | 'SELL';
  amountUsd: number;
  fillPrice: number;
  slippagePercent: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  timestamp: number;
  explorerUrl: string;
}

export interface PaperTrade {
  id: string;
  symbol: string;
  tokenAddress: string;
  chain: ChainType;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  currentPrice: number;
  amountUsd: number;
  pnlUsd: number;
  pnlPercent: number;
  status: 'OPEN' | 'CLOSED';
  openedAt: number;
  closedAt?: number;
  tp1Price?: number;
  stopLossPrice?: number;
}

export interface ExecutionLog {
  id: string;
  nodeId: string;
  nodeName?: string;
  nodeLabel?: string;
  type?: string;
  status?: 'running' | 'success' | 'error';
  timestamp: string;
  message: string;
  data?: any;
}

export type ExecutionStatus = 'idle' | 'running' | 'paused' | 'error';

export interface NodeState {
  status: string;
  outputData?: Record<string, any>;
  errorMessage?: string;
  lastExecuted?: string;
}

export type NodeCategory = 'input' | 'ai' | 'logic' | 'network' | 'output';
export type NodeType = string;

export interface NodePort {
  id?: string;
  name: string;
  type?: string;
  dataType?: string;
  label?: string;
  direction?: 'input' | 'output' | string;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  name?: string;
  label?: string;
  category: NodeCategory;
  x: number;
  y: number;
  config: Record<string, any>;
  state: NodeState;
  inputs: NodePort[];
  outputs: NodePort[];
}

export interface FlowConnection {
  id: string;
  fromNodeId: string;
  fromPort?: string;
  fromPortId?: string;
  toNodeId: string;
  toPort?: string;
  toPortId?: string;
}

export interface NodeTypeDefinition {
  type: NodeType;
  name?: string;
  label?: string;
  category: NodeCategory;
  iconName?: string;
  description: string;
  defaultInputs?: NodePort[];
  defaultOutputs?: NodePort[];
  inputs?: NodePort[];
  outputs?: NodePort[];
  defaultConfig: Record<string, any>;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  badge?: string;
  nodes: FlowNode[];
  connections: FlowConnection[];
}

