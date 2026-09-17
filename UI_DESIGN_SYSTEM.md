# 📐 Solana Alpha Scanner - UI Template Specification, Colors & Layout

Dokumentasi lengkap desain sistem, palet warna, tipografi, struktur grid, dan templat antarmuka pengguna (UI) untuk **Solana Alpha Scanner & Multi-Market Monitoring DApp**.

---

## 1. 🎨 Sistem Warna (Color Palette)

Aplikasi menggunakan tema **Dark Slate Cyber / Institutional Trading Desk** dengan kontras tinggi (WCAG AA Compliant), aksen neon Solana (Cyan & Emerald), serta identitas visual khas Pump.fun (Hot Pink / Fuchsia) dan Binance (Amber / Gold).

### A. Palet Dasar (Background & Surface)
| Role | Tailwind Class | Nilai HEX | Fungsi & Penempatan |
| :--- | :--- | :--- | :--- |
| **Canvas / Background** | `bg-slate-950` | `#020617` | Latar utama layar & monitor iPad |
| **Surface Card** | `bg-slate-900` / `bg-slate-900/80` | `#0f172a` | Kontainer kartu metrik, panel feed, modal |
| **Surface Elevated** | `bg-slate-850` / `bg-slate-800` | `#1e293b` | Baris tabel hover, sub-panel, input field |
| **Border Primary** | `border-slate-800` | `#1e293b` | Garis pembatas kartu & pemisah grid |
| **Border Muted** | `border-slate-850` / `border-slate-900` | `#0f172a` | Divider internal tabel & list item |

### B. Palet Teks & Tipografi
| Role | Tailwind Class | Nilai HEX | Fungsi & Penempatan |
| :--- | :--- | :--- | :--- |
| **Display / Heading** | `text-slate-100` / `text-white` | `#f1f5f9` | Judul panel, harga token, label CA |
| **Body Primary** | `text-slate-200` | `#e2e8f0` | Teks isi, nilai metrik utama |
| **Muted / Secondary** | `text-slate-400` | `#94a3b8` | Subtitle, keterangan slot RPC, deskripsi |
| **Dimmed / Timestamp** | `text-slate-500` / `text-slate-600` | `#64748b` | Waktu transaksi, hash truncate, link explorer |

### C. Aksen Semantik & Status (Chains & Ecosystems)
| Kategori | Tailwind Classes | Nilai HEX | Arti / Penggunaan |
| :--- | :--- | :--- | :--- |
| **Solana / Live RPC** | `text-cyan-400`, `bg-cyan-500` | `#22d3ee` | Identitas Solana, status aktif, live slot RPC |
| **Pump.fun CA** | `text-pink-400`, `bg-pink-500` | `#ec4899` | Bonding curve, KOTH (King of the Hill), Raydium grad |
| **Binance Macro** | `text-amber-400`, `bg-amber-500` | `#f59e0b` | Ticker harga 24h (BTC, ETH, SOL, BNB) |
| **Claude Engine** | `text-purple-400`, `bg-purple-500` | `#a855f7` | Keputusan otomatis AI (BUY, TAKE PROFIT, AVOID) |
| **Success / Low Risk** | `text-emerald-400`, `bg-emerald-500` | `#10b981` | Alpha signal score tinggi, sinyal BUY, online status |
| **Danger / High Risk** | `text-rose-400`, `bg-rose-500` | `#f43f5e` | Cluster rug risk, dev dump risk, offline RPC |

---

## 2. 🏛️ Tata Letak & Struktur Grid (Layout Hierarchy)

Layout dirancang responsif untuk **Desktop Monitor** dan **iPad Landscape (Multi-Market Monitoring)** dengan tata letak modular (Bento-style layout).

```
+-------------------------------------------------------------------------------+
| 1. HEADER & LIVE RPC BAR (Sticky Top z-30)                                    |
| [Logo/Title] [CA Filter Search]  [LIVE RPC] [Solana ID] [Test Signal] [Gear]  |
| [iPad View Switcher: ALL | PUMP.FUN | BINANCE MACRO | CLAUDE AI ENGINE]       |
+-------------------------------------------------------------------------------+
| 2. STATS KPI BAR (5 Kolom Metrik Ringkas)                                     |
| [Live Slot] | [24h Active Signals] | [Pump.fun Tokens] | [TPS/Latency] | [PnL]|
+-------------------------------------------------------------------------------+
| 3. MAIN WORKSPACE (Berdasarkan Mode View yang Dipilih)                        |
|                                                                               |
|  [Mode ALL: Split Bento Grid]                                                 |
|  +-------------------------------------+------------------------------------+ |
|  | Panel A: Active Alpha Signals (60%) | Panel B: Node Health & Pipe (40%)  | |
|  +-------------------------------------+------------------------------------+ |
|  | Panel C: Pump.fun CA Desk (Full Width / Card Carousel)                   | |
|  +-------------------------------------+------------------------------------+ |
|  | Panel D: Binance Macro Feed (50%)   | Panel E: Claude Trading Engine(50%)| |
|  +-------------------------------------+------------------------------------+ |
|  | Panel F: Bubble Map Cluster (40%)   | Panel G: Raw Transaction Feed (60%)| |
|  +-------------------------------------+------------------------------------+ |
|                                                                               |
|  [Mode PUMP: Full View Pump.fun Contract Address Terminal]                    |
|  [Mode BINANCE: Full View Macro Crypto Market Ticker Feed]                    |
|  [Mode CLAUDE: Full View Algorithmic Decision & Execution Desk]               |
+-------------------------------------------------------------------------------+
| 4. FOOTER                                                                     |
| [Ecosystem Attribution]                      [Data Provenance: Mainnet Real]  |
+-------------------------------------------------------------------------------+
| 5. MODAL LAYER (Solana ID Wallet, Settings Parameter, Gemini AI Explanation)   |
+-------------------------------------------------------------------------------+
```

---

## 3. 🧩 Spesifikasi Komponen UI

### A. Header Bar (`Header.tsx`)
- **Tinggi & Efek**: `64px` - `84px`, sticky position, blur transparan `bg-slate-950/90 backdrop-blur-md`.
- **Elemen Kiri**: Brand Icon dengan gradient Cyan-to-Pink (`from-cyan-500 via-pink-500 to-emerald-400`) dan judul monospace.
- **Elemen Tengah**: Quick CA Filter Search (`input` font monospace, icon kaca pembesar).
- **Elemen Kanan**:
  - Live RPC indicator (pulse ping green bullet).
  - Solana ID Connect button (`ID: 7xKX...pump` jika terhubung, gradient button jika belum).
  - Test Signal & Refresh controls.
- **Sub-bar (Layout Switcher)**: Switcher tab tombol untuk iPad (`ALL`, `PUMP`, `BINANCE`, `CLAUDE`).

### B. Pump.fun CA Scanner Desk (`PumpFunScanner.tsx`)
- **Struktur Kartu Token**:
  - **Header Kartu**: Nama koin, simbol (`$TAG`), dan status badge (`KOTH`, `GRADUATED`, atau `BONDING`).
  - **Contract Address (CA) Box**: Kotak monospace dengan tombol 1-click copy dan tautan langsung ke Pump.fun, DexScreener, dan Solscan.
  - **Bonding Curve Meter**: Bar progres horizontal warna gradien Fuchsia-ke-Cyan (0% s/d 100%).
  - **Metrik Finansial**: Market Cap ($ USD), Cadangan SOL, dan Creator Wallet.

### C. Binance Macro Feed (`BinanceTickerFeed.tsx`)
- **Format**: Grid kartu harga aset utama (`SOL/USDT`, `BTC/USDT`, `ETH/USDT`, `BNBUSDT`).
- **Data Tampilan**:
  - Harga saat ini berukuran besar (font tabular numbers).
  - Indikator 24h Change (Hijau `+X.XX%` jika naik, Merah `-X.XX%` jika turun).
  - Rentang 24h High & Low dengan progress bar indikator posisi harga.

### D. Claude Trading Engine (`ClaudeTradingLogic.tsx`)
- **Format**: Log audit kartu keputusan trading real-time.
- **Badge Keputusan**:
  - `BUY`: Latar emerald (`bg-emerald-950/80 text-emerald-400 border-emerald-800`).
  - `TAKE_PROFIT`: Latar cyan (`bg-cyan-950/80 text-cyan-400 border-cyan-800`).
  - `HOLD`: Latar amber (`bg-amber-950/80 text-amber-400 border-amber-800`).
  - `AVOID`: Latar rose (`bg-rose-950/80 text-rose-400 border-rose-800`).
- **Confidence Bar**: Tingkat keyakinan algoritma (0 - 100%).
- **Rule Matched**: Aturan algoritma yang terpenuhi (contoh: *King of the Hill Momentum Rule*, *Bonding Curve Threshold Safeguard*).

### E. Modal Layer (`SolanaIdModal.tsx`, `SettingsModal.tsx`, `AiExplainModal.tsx`)
- Latar backdrop gelap `bg-slate-950/80 backdrop-blur-sm`.
- Card modal terpusat dengan border `border-slate-800`, sudut membulat `rounded-2xl`, dan bayangan `shadow-2xl`.

---

## 4. 💻 Templat HTML & Tailwind Dasar

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Solana Alpha Scanner UI Template</title>
</head>
<body class="bg-slate-950 text-slate-100 antialiased font-sans">

  <!-- ROOT WRAPPER -->
  <div class="min-h-screen flex flex-col">
    
    <!-- HEADER BAR -->
    <header class="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 py-2.5 flex flex-col gap-2.5">
      <div class="flex items-center justify-between gap-3">
        <!-- Brand -->
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/20">
            <div class="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400">
              ⚡
            </div>
          </div>
          <div>
            <h1 class="text-sm md:text-base font-extrabold tracking-tight text-slate-100">
              SOLANA <span class="text-cyan-400">ALPHA SCANNER</span>
            </h1>
            <p class="text-[11px] text-slate-400 hidden sm:block">Pump.fun CA Tracker, Binance API & Claude Engine</p>
          </div>
        </div>

        <!-- Right Action Controls -->
        <div class="flex items-center gap-2 md:gap-3 font-mono text-xs">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-emerald-400">
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>LIVE RPC</span>
          </div>

          <button class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-slate-950 font-bold hover:opacity-90">
            Connect Solana ID
          </button>
        </div>
      </div>

      <!-- View Switcher -->
      <div class="flex items-center gap-1.5 pt-1 border-t border-slate-800/80 overflow-x-auto text-xs font-mono">
        <button class="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold">All Markets</button>
        <button class="px-3 py-1 rounded-lg bg-slate-900 text-slate-400 border border-slate-800">Pump.fun CA Desk</button>
        <button class="px-3 py-1 rounded-lg bg-slate-900 text-slate-400 border border-slate-800">Binance Macro</button>
        <button class="px-3 py-1 rounded-lg bg-slate-900 text-slate-400 border border-slate-800">Claude Trading</button>
      </div>
    </header>

    <!-- MAIN DASHBOARD CONTENT -->
    <main class="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 space-y-6">
      
      <!-- Stats KPI Bar -->
      <section class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span class="text-[10px] font-mono text-slate-400">CURRENT SLOT</span>
          <p class="text-base font-extrabold text-slate-100 font-mono mt-0.5">285,491,020</p>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span class="text-[10px] font-mono text-slate-400">ACTIVE ALPHA SIGNALS</span>
          <p class="text-base font-extrabold text-cyan-400 font-mono mt-0.5">14</p>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span class="text-[10px] font-mono text-slate-400">PUMP.FUN DISCOVERED</span>
          <p class="text-base font-extrabold text-pink-400 font-mono mt-0.5">48 Tokens</p>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span class="text-[10px] font-mono text-slate-400">NETWORK TPS</span>
          <p class="text-base font-extrabold text-emerald-400 font-mono mt-0.5">2,840 TPS</p>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <span class="text-[10px] font-mono text-slate-400">SIMULATED PNL</span>
          <p class="text-base font-extrabold text-emerald-400 font-mono mt-0.5">+$482.50</p>
        </div>
      </section>

      <!-- Bento Grid Panels -->
      <section class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-6 p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <h2 class="text-xs font-mono font-bold text-slate-300 mb-3">ACTIVE SIGNALS (SCORE >= 70)</h2>
          <!-- Signal items -->
        </div>
        <div class="lg:col-span-6 p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <h2 class="text-xs font-mono font-bold text-slate-300 mb-3">NODE PIPELINE ARCHITECTURE</h2>
          <!-- Pipeline flow -->
        </div>
      </section>

    </main>

    <!-- FOOTER -->
    <footer class="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1600px] mx-auto w-full">
      <span>Solana Alpha Scanner & Pump.fun Source Tracker</span>
      <span class="font-mono text-[10px] text-slate-600">Mainnet Data Live RPC & Binance API</span>
    </footer>

  </div>
</body>
</html>
```
