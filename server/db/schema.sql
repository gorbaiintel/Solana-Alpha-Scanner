-- Liquidity Intelligence DApp & Smart Money Scanner
-- PostgreSQL + TimescaleDB Production Schema
-- All timestamps UTC. Idempotent constraints on signatures & tx hashes.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Enable TimescaleDB extension if available
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- 1. Chains
CREATE TABLE IF NOT EXISTS chains (
    id VARCHAR(32) PRIMARY KEY, -- 'SOLANA', 'BNB'
    name VARCHAR(64) NOT NULL,
    rpc_url TEXT NOT NULL,
    ws_url TEXT,
    explorer_tx_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- 2. Tokens
CREATE TABLE IF NOT EXISTS tokens (
    address VARCHAR(128) NOT NULL,
    chain_id VARCHAR(32) REFERENCES chains(id),
    symbol VARCHAR(32),
    name VARCHAR(128),
    decimals INT DEFAULT 9,
    creator VARCHAR(128),
    creation_tx VARCHAR(128),
    creation_block BIGINT,
    creation_time TIMESTAMPTZ,
    total_supply NUMERIC(38, 0),
    mint_authority VARCHAR(128),
    freeze_authority VARCHAR(128),
    source VARCHAR(64) NOT NULL, -- 'SOLANA_RPC', 'PANCAKESWAP', etc.
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'UTC'),
    PRIMARY KEY (chain_id, address)
);

-- 3. Token Metadata
CREATE TABLE IF NOT EXISTS token_metadata (
    token_address VARCHAR(128) NOT NULL,
    chain_id VARCHAR(32) NOT NULL,
    logo_uri TEXT,
    website TEXT,
    twitter TEXT,
    telegram TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'UTC'),
    PRIMARY KEY (chain_id, token_address),
    FOREIGN KEY (chain_id, token_address) REFERENCES tokens(chain_id, address) ON DELETE CASCADE
);

-- 4. Pools
CREATE TABLE IF NOT EXISTS pools (
    address VARCHAR(128) NOT NULL,
    chain_id VARCHAR(32) REFERENCES chains(id),
    dex VARCHAR(64) NOT NULL, -- 'RAYDIUM', 'ORCA', 'METEORA', 'PANCAKESWAP', 'FLAP'
    token_a VARCHAR(128) NOT NULL,
    token_b VARCHAR(128) NOT NULL,
    fee_tier_bps INT DEFAULT 25,
    factory_address VARCHAR(128),
    source VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'UTC'),
    PRIMARY KEY (chain_id, address)
);

-- 5. Pool Reserves (Hypertable)
CREATE TABLE IF NOT EXISTS pool_reserves (
    pool_address VARCHAR(128) NOT NULL,
    chain_id VARCHAR(32) NOT NULL,
    reserve_a NUMERIC(38, 18) NOT NULL,
    reserve_b NUMERIC(38, 18) NOT NULL,
    liquidity_usd NUMERIC(24, 4),
    slot_or_block BIGINT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    source VARCHAR(64) NOT NULL,
    PRIMARY KEY (chain_id, pool_address, timestamp)
);

-- 6. Swaps (Hypertable)
CREATE TABLE IF NOT EXISTS swaps (
    id UUID DEFAULT uuid_generate_v4(),
    chain_id VARCHAR(32) NOT NULL,
    dex VARCHAR(64) NOT NULL,
    pool_address VARCHAR(128) NOT NULL,
    tx_hash VARCHAR(128) NOT NULL,
    slot_or_block BIGINT NOT NULL,
    block_time TIMESTAMPTZ NOT NULL,
    token_in VARCHAR(128) NOT NULL,
    token_out VARCHAR(128) NOT NULL,
    amount_in NUMERIC(38, 18) NOT NULL,
    amount_out NUMERIC(38, 18) NOT NULL,
    price_usd NUMERIC(28, 10),
    trader_wallet VARCHAR(128) NOT NULL,
    source VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'UTC'),
    CONSTRAINT uq_swap_tx_pool UNIQUE (chain_id, tx_hash, pool_address)
);

-- 7. Liquidity Events
CREATE TABLE IF NOT EXISTS liquidity_events (
    id UUID DEFAULT uuid_generate_v4(),
    chain_id VARCHAR(32) NOT NULL,
    dex VARCHAR(64) NOT NULL,
    pool_address VARCHAR(128) NOT NULL,
    tx_hash VARCHAR(128) NOT NULL,
    event_type VARCHAR(32) NOT NULL, -- 'ADD', 'REMOVE', 'CREATE'
    amount_a NUMERIC(38, 18) NOT NULL,
    amount_b NUMERIC(38, 18) NOT NULL,
    liquidity_usd NUMERIC(24, 4),
    provider_wallet VARCHAR(128) NOT NULL,
    slot_or_block BIGINT NOT NULL,
    block_time TIMESTAMPTZ NOT NULL,
    source VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- 8. Blocks
CREATE TABLE IF NOT EXISTS blocks (
    chain_id VARCHAR(32) NOT NULL,
    block_number_or_slot BIGINT NOT NULL,
    block_hash VARCHAR(128),
    block_time TIMESTAMPTZ NOT NULL,
    tx_count INT,
    source VARCHAR(64) NOT NULL,
    PRIMARY KEY (chain_id, block_number_or_slot)
);

-- 9. Transactions
CREATE TABLE IF NOT EXISTS transactions (
    chain_id VARCHAR(32) NOT NULL,
    tx_hash VARCHAR(128) NOT NULL,
    slot_or_block BIGINT NOT NULL,
    block_time TIMESTAMPTZ NOT NULL,
    from_address VARCHAR(128) NOT NULL,
    to_address VARCHAR(128),
    status VARCHAR(16) NOT NULL, -- 'SUCCESS', 'FAILED'
    fee NUMERIC(28, 9),
    err TEXT,
    source VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'UTC'),
    PRIMARY KEY (chain_id, tx_hash)
);

-- 10. Wallets
CREATE TABLE IF NOT EXISTS wallets (
    address VARCHAR(128) NOT NULL,
    chain_id VARCHAR(32) NOT NULL,
    first_seen TIMESTAMPTZ,
    last_seen TIMESTAMPTZ,
    tx_count INT DEFAULT 0,
    win_rate NUMERIC(5, 2),
    realized_pnl_usd NUMERIC(18, 2),
    label VARCHAR(32) DEFAULT 'UNKNOWN', -- 'DEV', 'SMART', 'WHALE', 'FRESH', 'BOT', 'RETAIL', 'UNKNOWN'
    updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'UTC'),
    PRIMARY KEY (chain_id, address)
);

-- 11. Wallet Labels
CREATE TABLE IF NOT EXISTS wallet_labels (
    address VARCHAR(128) NOT NULL,
    chain_id VARCHAR(32) NOT NULL,
    label VARCHAR(32) NOT NULL,
    confidence NUMERIC(5, 2),
    assigned_by VARCHAR(64) NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'UTC'),
    PRIMARY KEY (chain_id, address, label)
);

-- 12. Wallet Activity
CREATE TABLE IF NOT EXISTS wallet_activity (
    id UUID DEFAULT uuid_generate_v4(),
    chain_id VARCHAR(32) NOT NULL,
    wallet_address VARCHAR(128) NOT NULL,
    tx_hash VARCHAR(128) NOT NULL,
    activity_type VARCHAR(32) NOT NULL,
    token_address VARCHAR(128),
    amount_usd NUMERIC(18, 2),
    timestamp TIMESTAMPTZ NOT NULL,
    source VARCHAR(64) NOT NULL
);

-- 13. Wallet Positions
CREATE TABLE IF NOT EXISTS wallet_positions (
    id UUID DEFAULT uuid_generate_v4(),
    chain_id VARCHAR(32) NOT NULL,
    wallet_address VARCHAR(128) NOT NULL,
    token_address VARCHAR(128) NOT NULL,
    entry_price_usd NUMERIC(28, 10) NOT NULL,
    entry_time TIMESTAMPTZ NOT NULL,
    token_amount NUMERIC(38, 18) NOT NULL,
    remaining_amount NUMERIC(38, 18) NOT NULL,
    status VARCHAR(16) NOT NULL -- 'OPEN', 'CLOSED'
);

-- 14. Wallet PnL
CREATE TABLE IF NOT EXISTS wallet_pnl (
    chain_id VARCHAR(32) NOT NULL,
    wallet_address VARCHAR(128) NOT NULL,
    token_address VARCHAR(128) NOT NULL,
    realized_pnl_usd NUMERIC(18, 2) NOT NULL,
    roi_percent NUMERIC(10, 2),
    exit_time TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (chain_id, wallet_address, token_address, exit_time)
);

-- 15. Holders
CREATE TABLE IF NOT EXISTS holders (
    chain_id VARCHAR(32) NOT NULL,
    token_address VARCHAR(128) NOT NULL,
    wallet_address VARCHAR(128) NOT NULL,
    balance NUMERIC(38, 18) NOT NULL,
    percentage NUMERIC(6, 3) NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'UTC'),
    PRIMARY KEY (chain_id, token_address, wallet_address)
);

-- 16. Holder Snapshots
CREATE TABLE IF NOT EXISTS holder_snapshots (
    id UUID DEFAULT uuid_generate_v4(),
    chain_id VARCHAR(32) NOT NULL,
    token_address VARCHAR(128) NOT NULL,
    top10_concentration NUMERIC(6, 3) NOT NULL,
    top20_concentration NUMERIC(6, 3) NOT NULL,
    dev_concentration NUMERIC(6, 3) NOT NULL,
    fresh_concentration NUMERIC(6, 3) NOT NULL,
    cluster_concentration NUMERIC(6, 3) NOT NULL,
    snapshot_time TIMESTAMPTZ NOT NULL
);

-- 17. Smart Money
CREATE TABLE IF NOT EXISTS smart_money (
    chain_id VARCHAR(32) NOT NULL,
    wallet_address VARCHAR(128) NOT NULL,
    score INT NOT NULL,
    win_rate NUMERIC(5, 2) NOT NULL,
    avg_hold_minutes NUMERIC(10, 2),
    total_profit_usd NUMERIC(18, 2) NOT NULL,
    last_trade_time TIMESTAMPTZ,
    PRIMARY KEY (chain_id, wallet_address)
);

-- 18. Price Candles (1m, 5m, 15m, 1h, 4h, 1d)
CREATE TABLE IF NOT EXISTS price_candles (
    chain_id VARCHAR(32) NOT NULL,
    token_address VARCHAR(128) NOT NULL,
    timeframe VARCHAR(8) NOT NULL, -- '1m', '5m', '15m', '1h', '4h', '1d'
    open_time TIMESTAMPTZ NOT NULL,
    open_price NUMERIC(28, 10) NOT NULL,
    high_price NUMERIC(28, 10) NOT NULL,
    low_price NUMERIC(28, 10) NOT NULL,
    close_price NUMERIC(28, 10) NOT NULL,
    volume_token NUMERIC(38, 18) NOT NULL,
    volume_usd NUMERIC(24, 4) NOT NULL,
    trade_count INT NOT NULL,
    PRIMARY KEY (chain_id, token_address, timeframe, open_time)
);

-- 19. Liquidity Zones
CREATE TABLE IF NOT EXISTS liquidity_zones (
    id UUID DEFAULT uuid_generate_v4(),
    chain_id VARCHAR(32) NOT NULL,
    token_address VARCHAR(128) NOT NULL,
    zone_type VARCHAR(16) NOT NULL, -- 'SUPPLY', 'DEMAND', 'EQH', 'EQL'
    price_high NUMERIC(28, 10) NOT NULL,
    price_low NUMERIC(28, 10) NOT NULL,
    liquidity_usd NUMERIC(24, 4),
    status VARCHAR(16) DEFAULT 'ACTIVE'
);

-- 20. FVG Zones
CREATE TABLE IF NOT EXISTS fvg_zones (
    id UUID DEFAULT uuid_generate_v4(),
    chain_id VARCHAR(32) NOT NULL,
    token_address VARCHAR(128) NOT NULL,
    top_price NUMERIC(28, 10) NOT NULL,
    bottom_price NUMERIC(28, 10) NOT NULL,
    is_mitigated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- 21. Sweeps
CREATE TABLE IF NOT EXISTS sweeps (
    id UUID DEFAULT uuid_generate_v4(),
    chain_id VARCHAR(32) NOT NULL,
    token_address VARCHAR(128) NOT NULL,
    sweep_type VARCHAR(16) NOT NULL, -- 'HIGH_SWEEP', 'LOW_SWEEP'
    price NUMERIC(28, 10) NOT NULL,
    volume_usd NUMERIC(24, 4) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL
);

-- 22. HTF Levels & Trendlines
CREATE TABLE IF NOT EXISTS htf_levels (
    id UUID DEFAULT uuid_generate_v4(),
    chain_id VARCHAR(32) NOT NULL,
    token_address VARCHAR(128) NOT NULL,
    level_type VARCHAR(32) NOT NULL, -- 'DAILY_HIGH', 'WEEKLY_OPEN'
    price NUMERIC(28, 10) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS trendlines (
    id UUID DEFAULT uuid_generate_v4(),
    chain_id VARCHAR(32) NOT NULL,
    token_address VARCHAR(128) NOT NULL,
    slope NUMERIC(18, 8) NOT NULL,
    intercept NUMERIC(28, 10) NOT NULL,
    r_squared NUMERIC(6, 4)
);

-- 23. Signals & Risk Events
CREATE TABLE IF NOT EXISTS signals (
    id VARCHAR(128) PRIMARY KEY,
    chain_id VARCHAR(32) NOT NULL,
    token_address VARCHAR(128) NOT NULL,
    type VARCHAR(16) NOT NULL, -- 'BUY', 'SELL', 'WATCH', 'BLOCKED'
    price_at_signal NUMERIC(28, 10) NOT NULL,
    score INT NOT NULL,
    confidence INT NOT NULL,
    reasons JSONB NOT NULL,
    risk_level VARCHAR(16) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    source_events JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS risk_events (
    id UUID DEFAULT uuid_generate_v4(),
    chain_id VARCHAR(32) NOT NULL,
    token_address VARCHAR(128) NOT NULL,
    risk_factor VARCHAR(64) NOT NULL,
    severity VARCHAR(16) NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- 24. Trading: Orders, Executions, Positions, Bot Runs, Audit Logs
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(128) PRIMARY KEY,
    chain_id VARCHAR(32) NOT NULL,
    wallet_address VARCHAR(128) NOT NULL,
    token_address VARCHAR(128) NOT NULL,
    side VARCHAR(8) NOT NULL, -- 'BUY', 'SELL'
    amount_usd NUMERIC(18, 2) NOT NULL,
    target_price NUMERIC(28, 10),
    slippage_bps INT NOT NULL,
    status VARCHAR(16) NOT NULL, -- 'PENDING', 'SUBMITTED', 'FILLED', 'REJECTED', 'CANCELLED'
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS executions (
    id VARCHAR(128) PRIMARY KEY,
    order_id VARCHAR(128) REFERENCES orders(id),
    chain_id VARCHAR(32) NOT NULL,
    tx_hash VARCHAR(128) NOT NULL,
    route VARCHAR(64) NOT NULL, -- 'JUPITER', 'RAYDIUM', 'PANCAKESWAP', etc.
    token_in VARCHAR(128) NOT NULL,
    token_out VARCHAR(128) NOT NULL,
    amount_in NUMERIC(38, 18) NOT NULL,
    amount_out NUMERIC(38, 18) NOT NULL,
    expected_amount NUMERIC(38, 18) NOT NULL,
    actual_amount NUMERIC(38, 18) NOT NULL,
    fill_price NUMERIC(28, 10) NOT NULL,
    slippage_bps INT,
    price_impact_bps INT,
    gas_cost_usd NUMERIC(12, 4),
    dex_fee_usd NUMERIC(12, 4),
    status VARCHAR(16) NOT NULL,
    explorer_url TEXT,
    timestamp TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS positions (
    id VARCHAR(128) PRIMARY KEY,
    chain_id VARCHAR(32) NOT NULL,
    wallet_address VARCHAR(128) NOT NULL,
    token_address VARCHAR(128) NOT NULL,
    entry_fill_price NUMERIC(28, 10) NOT NULL,
    current_price NUMERIC(28, 10) NOT NULL,
    token_quantity NUMERIC(38, 18) NOT NULL,
    entry_cost_usd NUMERIC(18, 2) NOT NULL,
    realized_pnl_usd NUMERIC(18, 2) DEFAULT 0,
    unrealized_pnl_usd NUMERIC(18, 2) DEFAULT 0,
    fees_paid_usd NUMERIC(12, 4) DEFAULT 0,
    gas_paid_usd NUMERIC(12, 4) DEFAULT 0,
    tp1_price NUMERIC(28, 10),
    tp2_price NUMERIC(28, 10),
    tp3_price NUMERIC(28, 10),
    trailing_stop_price NUMERIC(28, 10),
    state VARCHAR(16) NOT NULL, -- 'ENTRY', 'TP1', 'TP2', 'TP3', 'TRAILING', 'STOP', 'CLOSED'
    entry_tx_hash VARCHAR(128),
    exit_tx_hash VARCHAR(128),
    opened_at TIMESTAMPTZ NOT NULL,
    closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS bot_runs (
    id UUID DEFAULT uuid_generate_v4(),
    state VARCHAR(16) NOT NULL, -- 'DISABLED', 'ARMED', 'RUNNING', 'PAUSED', 'KILL_SWITCH'
    started_at TIMESTAMPTZ NOT NULL,
    stopped_at TIMESTAMPTZ,
    total_trades INT DEFAULT 0,
    net_pnl_usd NUMERIC(18, 2) DEFAULT 0,
    stop_reason TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT uuid_generate_v4(),
    chain_id VARCHAR(32),
    action VARCHAR(64) NOT NULL, -- 'SIGNAL', 'RISK_DECISION', 'QUOTE', 'SIMULATION', 'EXECUTION', 'TRANSACTION', 'CONFIRMATION', 'POSITION_UPDATE', 'KILL_SWITCH'
    payload JSONB NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'UTC')
);

-- Indexing for real-time querying
CREATE INDEX IF NOT EXISTS idx_swaps_pool_time ON swaps(chain_id, pool_address, block_time DESC);
CREATE INDEX IF NOT EXISTS idx_swaps_trader ON swaps(chain_id, trader_wallet);
CREATE INDEX IF NOT EXISTS idx_price_candles_token ON price_candles(chain_id, token_address, timeframe, open_time DESC);
CREATE INDEX IF NOT EXISTS idx_signals_token ON signals(chain_id, token_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_positions_wallet ON positions(chain_id, wallet_address, state);
CREATE INDEX IF NOT EXISTS idx_audit_action_time ON audit_logs(action, timestamp DESC);
