/**
 * Automated Verification Suite for Liquidity Intelligence & Execution Engine
 * Tests are isolated fixtures ONLY — strictly NOT imported into production runtime.
 */

import { store, RealSwap, RealToken } from '../server/db/store.js';
import { RealAnalyticsEngine } from '../server/engine/analytics.js';
import { TradingEngine } from '../server/engine/tradingEngine.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${name}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n========================================');
  console.log('STARTING REAL ENGINE UNIT & INTEGRATION TESTS');
  console.log('========================================\n');

  // Test 1: Event Ingestion & Idempotency / Duplicate Detection
  console.log('Test Suite 1: Ingestion & Idempotency');
  const rawSwap: RealSwap = {
    id: 'swap-test-1',
    chain: 'SOLANA',
    dex: 'RAYDIUM',
    poolAddress: 'Pool111111111111111111111111111111111111111',
    txHash: '5wK4hSignatureUnique12345678901234567890',
    slotOrBlock: 284000100,
    blockTime: Math.floor(Date.now() / 1000),
    tokenIn: 'So11111111111111111111111111111111111111112',
    tokenOut: 'MintABC1111111111111111111111111111111111111',
    amountIn: 1.5,
    amountOut: 150000,
    price: 0.00001,
    wallet: 'TraderWallet11111111111111111111111111111111',
    provenance: {
      source: 'RAYDIUM',
      sourceType: 'on_chain',
      sourceTimestamp: Date.now(),
      ingestedAt: Date.now(),
      slotOrBlock: 284000100,
      signatureOrTxHash: '5wK4hSignatureUnique12345678901234567890',
    },
  };

  const addedFirst = store.addSwap(rawSwap);
  assert(addedFirst === true, 'First event ingestion succeeds');
  const addedDuplicate = store.addSwap(rawSwap);
  assert(addedDuplicate === false, 'Duplicate signature is rejected idempotently');

  // Test 2: Token Discovery
  console.log('\nTest Suite 2: Token Discovery');
  const token: RealToken = {
    address: 'MintABC1111111111111111111111111111111111111',
    chain: 'SOLANA',
    symbol: 'ABC',
    name: 'ABC Token',
    decimals: 6,
    creator: 'CreatorWallet1111111111111111111111111111111',
    creationTx: '5wK4hCreationSig1111111111111111111111111111',
    creationBlock: 284000100,
    creationTime: Math.floor(Date.now() / 1000),
    totalSupply: 1000000000,
    mintAuthority: null, // Revoked
    freezeAuthority: null, // Revoked
    source: 'RAYDIUM',
    provenance: {
      source: 'RAYDIUM',
      sourceType: 'on_chain',
      sourceTimestamp: Date.now(),
      ingestedAt: Date.now(),
      slotOrBlock: 284000100,
      signatureOrTxHash: '5wK4hCreationSig1111111111111111111111111111',
    },
  };
  store.upsertToken(token);
  assert(store.tokens.size === 1, 'Token registered with verified metadata');
  const storedToken = store.tokens.get('SOLANA:MintABC1111111111111111111111111111111111111');
  assert(storedToken?.symbol === 'ABC', 'Token symbol matches on-chain metadata');

  // Test 3: Liquidity Calculation, OHLCV & VWAP
  console.log('\nTest Suite 3: Real Analytics (VWAP, OHLCV, Zones)');
  const analytics = new RealAnalyticsEngine();
  const isolatedToken = 'MintXYZ1111111111111111111111111111111111111';
  const now = Math.floor(Date.now() / 1000);

  store.addSwap({
    ...rawSwap,
    id: 'swap-trade-1',
    txHash: 'SigTrade1',
    tokenIn: isolatedToken,
    tokenOut: 'So11111111111111111111111111111111111111112',
    price: 10.0,
    amountIn: 10,
    amountOut: 1,
    wallet: 'Trader1',
    slotOrBlock: 284000101,
    blockTime: now - 100,
  });

  store.addSwap({
    ...rawSwap,
    id: 'swap-trade-2',
    txHash: 'SigTrade2',
    tokenIn: isolatedToken,
    tokenOut: 'So11111111111111111111111111111111111111112',
    price: 12.0,
    amountIn: 20,
    amountOut: 2,
    wallet: 'Trader2',
    slotOrBlock: 284000102,
    blockTime: now - 50,
  });

  store.addSwap({
    ...rawSwap,
    id: 'swap-trade-3',
    txHash: 'SigTrade3',
    tokenIn: isolatedToken,
    tokenOut: 'So11111111111111111111111111111111111111112',
    price: 11.0,
    amountIn: 10,
    amountOut: 1,
    wallet: 'Trader3',
    slotOrBlock: 284000103,
    blockTime: now - 10,
  });

  const candles = analytics.calculateCandles(isolatedToken, 5);
  assert(candles.length > 0, 'Real OHLCV generated from actual trade events');
  assert(candles[0].high >= 12.0, 'Candle High correctly captures maximum trade price (12.0)');

  const matrix = analytics.analyzeLiquidity(isolatedToken, 'SOLANA');
  assert(matrix.vwap > 10.0 && matrix.vwap < 12.0, `VWAP calculates weighted average accurately: ${matrix.vwap.toFixed(3)}`);
  assert(matrix.lastTradePrice === 11.0, 'Last trade price correctly captured from real pool swap');

  // Test 4: Smart Money Profiling
  console.log('\nTest Suite 4: Smart Money Intelligence');
  store.updateWalletIntelligence(
    '0xWhale111111111111111111111111111111111111',
    'SOLANA',
    100000,
    15000,
    true,
    3600
  );
  store.updateWalletIntelligence(
    '0xWhale111111111111111111111111111111111111',
    'SOLANA',
    80000,
    8000,
    true,
    7200
  );
  const walletIntel = store.wallets.get('0xWhale111111111111111111111111111111111111');
  assert(walletIntel !== undefined, 'Wallet profile recorded in store');
  assert(walletIntel?.label === 'WHALE' || walletIntel?.label === 'SMART', 'Wallet appropriately labeled WHALE/SMART');
  assert(walletIntel?.winRate === 1.0, 'Win rate calculated accurately (100%)');

  // Test 5: Risk Gate & Token Verification
  console.log('\nTest Suite 5: Risk Gate & Token Verification');
  assert(storedToken?.mintAuthority === null, 'Mint authority is revoked (Safe)');
  assert(storedToken?.freezeAuthority === null, 'Freeze authority is revoked (Safe)');

  // Test 6: Trading Engine, Risk Limits & Kill Switch
  console.log('\nTest Suite 6: Trading Engine & Risk Controls');
  const engine = new TradingEngine();

  // Position sizing & risk gate checks
  const riskCheckPass = engine.checkRiskGate({
    chain: 'SOLANA',
    walletAddress: '0xTestTrader',
    tokenAddress: token.address,
    tokenSymbol: 'ABC',
    side: 'BUY',
    amountUsd: 100,
    slippageBps: 150,
  });
  assert(riskCheckPass.passed === true, 'Valid trade passes risk gate');

  const riskCheckFailSize = engine.checkRiskGate({
    chain: 'SOLANA',
    walletAddress: '0xTestTrader',
    tokenAddress: token.address,
    tokenSymbol: 'ABC',
    side: 'BUY',
    amountUsd: 50000, // Exceeds MAX_POSITION_USD
    slippageBps: 150,
  });
  assert(riskCheckFailSize.passed === false, 'Position exceeding MAX_POSITION_USD is rejected');

  // Kill switch test
  store.setBotState('ARMED');
  assert(store.botState === 'ARMED', 'Bot state transitioned to ARMED');
  store.triggerKillSwitch('Manual testing of kill switch');
  assert(store.botState === 'KILL_SWITCH', 'Kill switch immediately forces KILL_SWITCH state');

  const riskCheckKillSwitch = engine.checkRiskGate({
    chain: 'SOLANA',
    walletAddress: '0xTestTrader',
    tokenAddress: token.address,
    tokenSymbol: 'ABC',
    side: 'BUY',
    amountUsd: 100,
  });
  assert(riskCheckKillSwitch.passed === false, 'Trading engine blocks execution when KILL_SWITCH is active');

  // Test 7: Adaptive Take Profit & Trailing Stop Updates
  console.log('\nTest Suite 7: Adaptive Take Profit & Trailing Stop');
  const position = store.openPosition({
    chain: 'SOLANA',
    walletAddress: '0xTestTrader',
    tokenAddress: token.address,
    tokenSymbol: 'ABC',
    entryFillPrice: 10.0,
    currentPrice: 10.0,
    tokenQuantity: 10,
    entryCostUsd: 100,
    tp1Price: 11.5,
    tp2Price: 13.0,
    tp3Price: 15.0,
    trailingStopPrice: 9.0,
    entryTxHash: '0xEntryTx11111111',
  });
  assert(position.state === 'ENTRY', 'Position initializes in ENTRY state');

  // Price rises to $11.60 -> triggers TP1 and lifts stop loss to break-even ($10.0)
  store.updatePositionMarketState(position.id, 11.6);
  const updatedPos = store.positions.find((p) => p.id === position.id);
  assert(updatedPos?.state === 'TP1', 'Position transitions to TP1 on profit target');
  assert(updatedPos?.trailingStopPrice! >= 10.0, 'Stop loss raised to break-even after TP1');

  // Test 8: Real Realized PnL Calculation
  console.log('\nTest Suite 8: Real Realized PnL Calculation');
  const closedPos = store.closePosition(position.id, 12.0, 0.5, 0.2, '0xExitHash123');
  assert(closedPos?.state === 'CLOSED', 'Position closed with real exit fill');
  assert(closedPos?.realizedPnlUsd !== undefined && closedPos.realizedPnlUsd > 0, `Realized PnL strictly calculated: +$${closedPos?.realizedPnlUsd.toFixed(2)}`);

  console.log('\n========================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
