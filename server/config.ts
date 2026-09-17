import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: Number(process.env.PORT || 3000),

  // Solana Mainnet RPC & WebSocket
  SOLANA_RPC_URL: process.env.SOLANA_RPC_URL || process.env.SOLANA_HTTP_RPC || 'https://api.mainnet-beta.solana.com',
  SOLANA_WS_URL: process.env.SOLANA_WS_URL || process.env.SOLANA_WS_RPC || 'wss://api.mainnet-beta.solana.com/',

  // BNB Smart Chain Mainnet RPC & WebSocket
  BNB_RPC_URL: process.env.BNB_RPC_URL || 'https://bsc-dataseed.binance.com/',
  BNB_WS_URL: process.env.BNB_WS_URL || 'wss://bsc-ws-node.nariox.org:443',

  // Jupiter API URL
  JUPITER_API_URL: process.env.JUPITER_API_URL || 'https://quote-api.jup.ag/v6',

  // Execution & Bot Mode
  EXECUTION_MODE: (process.env.EXECUTION_MODE || 'PAPER').toUpperCase() as 'PAPER' | 'LIVE',
  AUTOTRADE_ENABLED: String(process.env.AUTOTRADE_ENABLED || 'false') === 'true',

  // Hard Risk Limits
  MAX_POSITION_USD: Number(process.env.MAX_POSITION_USD || 1000),
  MAX_DAILY_LOSS_USD: Number(process.env.MAX_DAILY_LOSS_USD || 250),
  MAX_OPEN_POSITIONS: Number(process.env.MAX_OPEN_POSITIONS || 5),
  MAX_SLIPPAGE_BPS: Number(process.env.MAX_SLIPPAGE_BPS || 150),
  MAX_PRICE_IMPACT_BPS: Number(process.env.MAX_PRICE_IMPACT_BPS || 250),
  MIN_LIQUIDITY_USD: Number(process.env.MIN_LIQUIDITY_USD || 5000),

  // FLAP Adapter configuration (BNB Smart Chain)
  FLAP_FACTORY_ADDRESS: process.env.FLAP_FACTORY_ADDRESS || '',
  FLAP_ROUTER_ADDRESS: process.env.FLAP_ROUTER_ADDRESS || '',
  FLAP_POOL_FACTORY_ADDRESS: process.env.FLAP_POOL_FACTORY_ADDRESS || '',
  FLAP_EVENT_TOPICS: process.env.FLAP_EVENT_TOPICS || '',

  // Optional AI API Key
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
};
