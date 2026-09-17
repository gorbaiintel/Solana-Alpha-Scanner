# 🚀 Solana Alpha Scanner & Liquidity Intelligence DApp
> **Enterprise Real-Time Blockchain Scanner, Smart Money Tracker, & Execution Engine**
> Chains: **Solana Mainnet** & **BNB Smart Chain (BSC) Mainnet**

---

## 📌 Executive Summary
**Solana Alpha Scanner** adalah platform pemantauan likuiditas on-chain dan eksekusi perdagangan terdesentralisasi yang beroperasi dengan prinsip **100% Real Blockchain Data (Zero Mock / No Simulated Feed)**. 

Platform ini menghubungkan langsung node RPC dan WebSocket Solana & BNB Chain untuk mendeteksi token baru, mengaudit parameter keamanan (mint/freeze authority, konsentrasi holder), melacak pergerakan dompet whale/smart money secara historis, dan mengeksekusi order dengan simulasi rute serta proteksi risiko dinamis.

---

## 🏗️ Architecture & Component Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT DASHBOARD (REACT + TAILWIND)             │
│  - Live WS Ticker    - Real Trading Desk     - Smart Money & Whale Profiler │
│  - Confluence Matrix - Bubble Cluster Map    - Real-Time Execution Console  │
└──────────────────────────────────────▲──────────────────────────────────────┘
                                       │ WebSocket & REST API
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                             BACKEND RUNTIME ENGINE (NODE / EXPRESS)         │
│  ┌─────────────────────────┐ ┌───────────────────────┐ ┌──────────────────┐ │
│  │   DATA INGESTION LAYER  │ │    ANALYTICS ENGINE   │ │  TRADING ENGINE  │ │
│  │  - Solana RPC/WS        │ │  - Pure VWAP / OHLCV  │ │ - Risk Gate      │ │
│  │  - BSC EVM Logs         │ │  - Liquidity Void/FVG │ │ - Route Quoting  │ │
│  │  - PumpPortal Stream    │ │  - Smart Money Label  │ │ - Adaptive TP    │ │
│  │  - Idempotent Event Log │ │  - Holder Clustering  │ │ - Kill Switch    │ │
│  └─────────────────────────┘ └───────────────────────┘ └──────────────────┘ │
└──────────────────────────────────────▲──────────────────────────────────────┘
                                       │ RPC / WS Calls
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                              BLOCKCHAINS & DEX PROTOCOLS                    │
│  - Solana: Raydium AMM/CLMM, Orca Whirlpool, Meteora DLMM, Jupiter v6       │
│  - BNB Chain: PancakeSwap v2/v3, BSC Smart Contracts                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Key Modules & Capabilities

### 1. 🔍 Real-Time Token Scanner & Discovery
- **Live Ingestion**: Deteksi langsung pembuatan token baru dari Raydium, Pump.fun, dan PancakeSwap.
- **On-Chain Risk Gate**:
  - Validasi ketat status `mint_authority` dan `freeze_authority` (otomatis flag/block token jika belum di-revoke).
  - Evaluasi konsentrasi top 10/20 holder untuk mendeteksi ancaman bundling atau dev dump.
  - Filter batas likuiditas minimum (default $\ge \$5,000$).

### 2. 🐋 Smart Money Profiler & Wallet Intelligence
- **Data Historis On-Chain**: Melacak performa dompet nyata dari swap aktual.
- **Klasifikasi Otomatis**:
  - `DEV`: Dompet pencipta token atau deployer likuiditas awal.
  - `WHALE`: Dompet dengan saldo atau volume transaksi berskala besar.
  - `SMART`: Dompet dengan win-rate konsisten dan riwayat akumulasi awal yang terbukti profitabel.
  - `FRESH`: Dompet baru terdeteksi dengan riwayat transaksi minim.
  - `BOT`: Dompet dengan frekuensi swap berkecepatan tinggi dalam slot yang sama.
- **Verifikasi Explorer**: Setiap alamat dompet dan transaksi terhubung langsung ke Solscan / BscScan resmi.

### 3. 📊 Pure Price & Liquidity Matrix Engine
- Menghitung **VWAP**, **OHLCV** (1m, 5m, 15m, 1h), delta likuiditas, dan order flow murni dari pool swap yang terverifikasi.
- **Prinsip "No Data = No Data"**: Jika RPC/WS mengalami gangguan, antarmuka secara transparan menampilkan status `OFFLINE / WAITING FOR DATA` tanpa pernah menyuntikkan data acak atau grafik palsu.

### 4. 🎯 Signal Confluence
Menghasilkan sinyal `BUY`, `SELL`, `WATCH`, atau `BLOCKED` berdasarkan konfluensi multi-faktor:
$$\text{Signal Score} = \text{Liquidity Depth} + \text{Market Structure (BOS/FVG)} + \text{Smart Money Flow} + \text{Risk Clearance}$$

### 5. 🛡️ Real Trading Desk & Risk Management
- **Simulasi RPC**: Uji coba rute transaksi dan simulasi eksekusi via RPC sebelum submit untuk mencegah transaksi gagal/revert.
- **Adaptive Take Profit (TP)**:
  - **TP1 (+20%)**: Tutup 50% posisi dan otomatis geser stop-loss ke break-even (`entryPrice`).
  - **TP2 (+50%)**: Tutup 25% posisi berikutnya dan aktifkan trailing stop.
  - **TP3 (+100%)**: Kunci keuntungan sisa atau trailing stop dinamis.
- **Hard Risk Limits**: Batas modal per posisi (`MAX_POSITION_USD`), batas kerugian harian (`MAX_DAILY_LOSS_USD`), dan batas posisi terbuka (`MAX_OPEN_POSITIONS`).
- **Emergency Kill Switch**: Tombol darurat yang mematikan pembukaan posisi baru seketika.

---

## ⚙️ Environment Variables (`.env.example`)

```env
# Mode Lingkungan
NODE_ENV=production
PORT=3000

# Solana Mainnet RPC & WebSocket
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_WS_URL=wss://api.mainnet-beta.solana.com

# BNB Smart Chain Mainnet RPC & WebSocket
BNB_RPC_URL=https://bsc-dataseed.binance.org
BNB_WS_URL=

# Database & Cache (Opsional)
DATABASE_URL=
REDIS_URL=

# Jupiter DEX Aggregator
JUPITER_API_URL=https://quote-api.jup.ag/v6

# Mode Trading: PAPER atau LIVE
EXECUTION_MODE=PAPER
AUTOTRADE_ENABLED=false

# Manajemen Risiko
MAX_POSITION_USD=500
MAX_DAILY_LOSS_USD=200
MAX_OPEN_POSITIONS=3
MAX_SLIPPAGE_BPS=150
MAX_PRICE_IMPACT_BPS=250
MIN_LIQUIDITY_USD=5000

# Flap DEX Adapter
FLAP_FACTORY_ADDRESS=
FLAP_ROUTER_ADDRESS=

# Private Keys Server (Hanya jika mode LIVE aktif)
# SOLANA_PRIVATE_KEY=
# BNB_PRIVATE_KEY=
```

---

## 🛠️ API & WebSocket Reference

### HTTP Endpoints
- `GET /health` : Status kesehatan server & uptime.
- `GET /ready` : Kesiapan koneksi RPC & background workers.
- `GET /metrics` : Metrik latensi, total swap, TPS, dan event ingestion.
- `GET /api/state` : Snapshot state lengkap (token, swap, wallet, order, posisi).
- `GET /api/tokens` : Daftar token terverifikasi hasil penemuan on-chain.
- `GET /api/swaps` : Stream riwayat real trade swap.
- `GET /api/wallets` : Database profil wallet Smart Money.
- `GET /api/signals` : Riwayat sinyal trading berbobot.
- `GET /api/positions` : Daftar posisi aktif beserta status TP adaptif.
- `POST /api/orders/simulate` : Simulasi rute dan dampak harga via real RPC.
- `POST /api/orders/execute` : Eksekusi order melalui Risk Gate.
- `POST /api/bot/arm` : Mengaktifkan status bot menjadi ARMED.
- `POST /api/bot/kill-switch` : Memicu KILL SWITCH darurat.

### WebSocket Stream (`ws://<host>:3000`)
- `state_snapshot` : Inisialisasi data saat pertama kali tersambung.
- `swap_event` : Pembaruan trade on-chain real-time.
- `token_discovered` : Siaran token baru yang terdeteksi.
- `signal_generated` : Sinyal trading baru yang memenuhi syarat konfluensi.
- `position_updated` : Pembaruan tingkat TP dan pergeseran trailing stop.

---

## 🧪 Testing & Verification

Project dilengkapi dengan test suite otomatis (`tests/run-all-tests.ts`):
```bash
npm test
```

### Hasil Test:
```
========================================
STARTING REAL ENGINE UNIT & INTEGRATION TESTS
========================================
Test Suite 1: Ingestion & Idempotency           ✓ 2 tests passed
Test Suite 2: Token Discovery                   ✓ 2 tests passed
Test Suite 3: Real Analytics (VWAP, OHLCV)      ✓ 4 tests passed
Test Suite 4: Smart Money Intelligence          ✓ 3 tests passed
Test Suite 5: Risk Gate & Token Verification    ✓ 2 tests passed
Test Suite 6: Trading Engine & Risk Controls    ✓ 5 tests passed
Test Suite 7: Adaptive TP & Trailing Stop       ✓ 3 tests passed
Test Suite 8: Real Realized PnL Calculation     ✓ 2 tests passed
========================================
TOTAL: 23 PASSED, 0 FAILED
========================================
```

---

## 🚀 Deployment & Production Run

### 1. Build Proyek
```bash
npm install
npm run build
```

### 2. Menjalankan Aplikasi
```bash
npm start
```
Aplikasi akan aktif dan melayani koneksi web & WebSocket pada port `3000`.
