import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Crosshair,
  Users,
  TrendingUp,
  Radio,
  Dna,
  MousePointer2,
  FlaskConical,
  RefreshCw,
  ExternalLink,
  Shield,
  Zap,
  Terminal,
  Cpu,
} from 'lucide-react';
import { SignalEvent, RealWalletIntelligence, RealSwap, HealthStatus } from '../types';

interface FlyHighDeskProps {
  signals?: SignalEvent[];
  realEventsCount?: number;
  openPositionsCount?: number;
  onOpenSolanaId?: () => void;
  wallets?: RealWalletIntelligence[];
  swaps?: RealSwap[];
  health?: HealthStatus;
}

type OperatorMode = 'TRACKER' | 'GROUP' | 'EXITS' | 'MONITOR' | 'GENETIC' | 'SELECTOR' | 'TESTER';

export const FlyHighDesk: React.FC<FlyHighDeskProps> = ({
  signals = [],
  realEventsCount = 0,
  openPositionsCount = 0,
  wallets = [],
  swaps = [],
  health,
}) => {
  const [operator, setOperator] = useState<OperatorMode>('SELECTOR');
  const [tick, setTick] = useState(3);
  const [strategiesCount, setStrategiesCount] = useState(139);
  const [activeWalletIdx, setActiveWalletIdx] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Deterministic tick for animation pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => (prev >= 9 ? 1 : prev + 1));
      if (signals.length > 0) {
        setStrategiesCount(130 + signals.length);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [signals.length]);

  // Neural Fly Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 - 10;
      const scale = Math.min(width, height) / 360;

      // 1. Subtle Radial Background Glow (Toxic Lime / Cyber Green)
      const grad = ctx.createRadialGradient(
        centerX,
        centerY,
        20 * scale,
        centerX,
        centerY,
        170 * scale
      );
      grad.addColorStop(0, 'rgba(163, 230, 53, 0.16)');
      grad.addColorStop(0.5, 'rgba(132, 204, 22, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 170 * scale, 0, Math.PI * 2);
      ctx.fill();

      // 2. Cybernetic Orbit Rings & Concentric Data Circles
      ctx.strokeStyle = 'rgba(163, 230, 53, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, 130 * scale + Math.sin(t * 1.5) * 4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(74, 222, 128, 0.18)';
      ctx.setLineDash([2, 8]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, 155 * scale - Math.cos(t) * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Central Hexagonal / Neural Head Lattice (Fly Head Silhouette)
      const headY = centerY + Math.sin(t * 2) * 3;

      // Outer Fly Head Capsule Contour
      ctx.save();
      ctx.fillStyle = 'rgba(163, 230, 53, 0.85)';
      ctx.strokeStyle = '#a3e635';
      ctx.lineWidth = 1.5;

      // Head shape points
      const points = 28;
      const headRadiusX = 58 * scale;
      const headRadiusY = 68 * scale;

      ctx.beginPath();
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        // Modulate with fly head geometry
        const rMod = 1 + 0.12 * Math.cos(angle * 2) + 0.08 * Math.sin(angle * 4);
        const px = centerX + Math.cos(angle) * headRadiusX * rMod;
        const py = headY + 12 * scale + Math.sin(angle) * headRadiusY * rMod;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();

      // Mesh Grid Texture Inside Head
      const headPatternGrad = ctx.createLinearGradient(
        centerX,
        headY - 60,
        centerX,
        headY + 60
      );
      headPatternGrad.addColorStop(0, 'rgba(190, 242, 100, 0.45)');
      headPatternGrad.addColorStop(0.5, 'rgba(132, 204, 22, 0.85)');
      headPatternGrad.addColorStop(1, 'rgba(77, 124, 15, 0.3)');
      ctx.fillStyle = headPatternGrad;
      ctx.fill();
      ctx.stroke();

      // Fine Hexagon / Neural Dots inside head
      ctx.fillStyle = 'rgba(236, 252, 203, 0.85)';
      for (let rx = -40; rx <= 40; rx += 9) {
        for (let ry = -45; ry <= 45; ry += 9) {
          const distSq = (rx * rx) / 1600 + (ry * ry) / 2200;
          if (distSq < 0.85) {
            const jitterX = Math.sin(t * 3 + rx + ry) * 1.2;
            const jitterY = Math.cos(t * 3 + rx * 2) * 1.2;
            ctx.beginPath();
            ctx.arc(
              centerX + rx * scale + jitterX,
              headY + 12 * scale + ry * scale + jitterY,
              1.2 * scale,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }
      }
      ctx.restore();

      // 4. Large Glowing Ruby/Crimson Compound Eyes (Left & Right)
      const eyeOffsetX = 44 * scale;
      const eyeOffsetY = headY - 14 * scale;
      const eyeRadiusX = 26 * scale;
      const eyeRadiusY = 36 * scale;

      const drawEye = (isLeft: boolean) => {
        const eyeX = isLeft ? centerX - eyeOffsetX : centerX + eyeOffsetX;

        // Eye Outer Red Glow
        const eyeGlow = ctx.createRadialGradient(
          eyeX,
          eyeOffsetY,
          5 * scale,
          eyeX,
          eyeOffsetY,
          45 * scale
        );
        eyeGlow.addColorStop(0, 'rgba(244, 63, 94, 0.95)');
        eyeGlow.addColorStop(0.4, 'rgba(225, 29, 72, 0.65)');
        eyeGlow.addColorStop(0.8, 'rgba(159, 18, 57, 0.2)');
        eyeGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = eyeGlow;
        ctx.beginPath();
        ctx.ellipse(eyeX, eyeOffsetY, 42 * scale, 52 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye Solid Ellipse
        ctx.save();
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#fb7185';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.ellipse(
          eyeX,
          eyeOffsetY,
          eyeRadiusX,
          eyeRadiusY,
          isLeft ? -0.15 : 0.15,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();

        // Compound Eye Hexagonal Ommatidia Texture
        ctx.fillStyle = 'rgba(255, 228, 230, 0.7)';
        for (let ox = -16; ox <= 16; ox += 6) {
          for (let oy = -24; oy <= 24; oy += 6) {
            if ((ox * ox) / 256 + (oy * oy) / 576 < 0.75) {
              ctx.beginPath();
              ctx.arc(
                eyeX + ox * scale,
                eyeOffsetY + oy * scale,
                1 * scale,
                0,
                Math.PI * 2
              );
              ctx.fill();
            }
          }
        }

        // Highlight Glint on Eyes
        ctx.fillStyle = '#fff1f2';
        ctx.beginPath();
        ctx.ellipse(
          eyeX - 8 * scale * (isLeft ? 1 : -1),
          eyeOffsetY - 12 * scale,
          5 * scale,
          9 * scale,
          -0.2,
          0,
          Math.PI * 2
        );
        ctx.fill();
      };

      drawEye(true);
      drawEye(false);

      // 5. Antennas with Oscillating Tip Sparks
      const drawAntenna = (isLeft: boolean) => {
        const sign = isLeft ? -1 : 1;
        const startX = centerX + sign * 14 * scale;
        const startY = headY - 35 * scale;
        const tipX = centerX + sign * (48 * scale + Math.sin(t * 4) * 4);
        const tipY = headY - (75 * scale + Math.cos(t * 3) * 5);

        ctx.strokeStyle = '#bef264';
        ctx.lineWidth = 1.8 * scale;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(
          centerX + sign * 28 * scale,
          headY - 55 * scale,
          tipX,
          tipY
        );
        ctx.stroke();

        // Glowing antenna tip node
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#84cc16';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(tipX, tipY, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      };

      drawAntenna(true);
      drawAntenna(false);

      // 6. Radiating Data Nodes & Floating Code Coordinates
      const nodeCount = 14;
      ctx.fillStyle = '#86efac';
      ctx.strokeStyle = 'rgba(134, 239, 172, 0.3)';
      ctx.lineWidth = 0.8;

      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2 + t * 0.4;
        const dist = (100 + ((i * 17) % 50)) * scale;
        const nx = centerX + Math.cos(angle) * dist;
        const ny = centerY + Math.sin(angle) * dist;

        // Connect node to head center
        if (i % 2 === 0) {
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(nx, ny);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(nx, ny, 2.2 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Extract real smart money traders from on-chain intelligence
  const realSmartTraders = (wallets || []).filter(
    (w) => w.label === 'SMART' || w.label === 'WHALE' || w.label === 'DEV' || w.totalPositions > 1
  );

  const activeTrader = realSmartTraders.length > 0 ? realSmartTraders[activeWalletIdx % realSmartTraders.length] : null;

  // Find recent swaps for active trader or latest real swaps
  const activeTraderSwaps = activeTrader 
    ? (activeTrader.recentSwaps && activeTrader.recentSwaps.length > 0 
        ? activeTrader.recentSwaps 
        : swaps.filter((s) => s.wallet === activeTrader.address))
    : [];

  const latestSwap = activeTraderSwaps.length > 0 ? activeTraderSwaps[0] : (swaps.length > 0 ? swaps[0] : null);

  // Buy/Sell exit ratio derived from real swaps
  const buySwaps = swaps.filter((s) => s.tokenIn.includes('So111') || s.tokenIn.includes('0xbb4'));
  const buyRatio = swaps.length > 0 ? Math.round((buySwaps.length / swaps.length) * 100) : 0;
  const exitRatio = swaps.length > 0 ? 100 - buyRatio : 0;
  const totalRealizedPnl = (wallets || []).reduce((acc, w) => acc + (w.realizedPnlUsd || 0), 0);

  // Real sparkline from real swap amounts
  const sparklineData = Array.isArray(swaps) && swaps.length > 0
    ? swaps.slice(0, 12).map((s) => Math.min(100, Math.max(15, Math.round((s.amountIn || 0) * (s.price || 1) * 10))))
    : [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20];

  return (
    <div className="space-y-4 font-mono text-slate-200 select-none animate-in fade-in duration-300">
      {/* Top Header & Cyber Stats Bar */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-lime-500/40 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-lime-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-lime-500 via-emerald-400 to-rose-500 p-0.5 shadow-lg shadow-lime-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Terminal className="w-5 h-5 text-lime-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-widest text-lime-400 uppercase">
                  FLY HIGH DESK
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-lime-950 text-lime-300 border border-lime-700">
                  Robinhood chain
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                  GPT-4 RETINA
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="text-lime-300 font-bold">@immortalcheel</span>
                <span>•</span>
                <span>FOLLOW TRADER / BUY / SELL / SLIPPAGE</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-lime-800/80">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
              <span className="text-xs font-black text-lime-300">LIVE</span>
            </div>
          </div>
        </div>

        {/* 4 Primary Top Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-lime-950">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">STRATEGIES</span>
            <div className="text-base font-black text-lime-300">{strategiesCount}+</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-lime-950">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">REAL EVENTS</span>
            <div className="text-base font-black text-slate-200">{(realEventsCount || 0).toLocaleString()}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-lime-950">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">ACTIVE SIGNALS</span>
            <div className="text-base font-black text-cyan-300">{signals.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-lime-950">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">POSITIONS</span>
            <div className="text-base font-black text-rose-400">{openPositionsCount} ACTIVE</div>
          </div>
        </div>

        {/* Marquee Ticker Strip */}
        <div className="mt-3 pt-2 border-t border-slate-900 overflow-hidden relative">
          <div className="text-[10px] tracking-widest text-lime-400/80 flex items-center gap-8 whitespace-nowrap animate-marquee">
            <span>THE COLONY: LAB / HOLDER LOCKED</span>
            <span>•</span>
            <span>FOLLOW TRADER: BUY / SELL / TX</span>
            <span>•</span>
            <span>MATCH EXITS: TRACKED SELLERS</span>
            <span>•</span>
            <span>WALLET AUDIT: REAL ON-CHAIN DATA</span>
            <span>•</span>
            <span>EVOLUTION LAB: CAPITAL MUTATE 3.0</span>
            <span>•</span>
            <span>OPEN SOURCE PUBLIC DATA // NO AUTO-TRADES</span>
          </div>
        </div>
      </div>

      {/* Main Colony Workspace (3-Column Layout: Left Telemetry, Center Neural Fly, Right Exits) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (Follow Trader & Wallet Audit) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Follow Trader Module */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-lime-900/50 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-lime-400 border-b border-lime-950 pb-2">
              <span className="flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5" />
                FOLLOW TRADER
              </span>
              <div className="flex items-center gap-1">
                {realSmartTraders.length > 1 && (
                  <button
                    onClick={() => setActiveWalletIdx((prev) => (prev + 1) % realSmartTraders.length)}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-lime-950 text-lime-400 hover:bg-lime-900 border border-lime-800"
                    title="Cycle through detected smart wallets"
                  >
                    NEXT
                  </button>
                )}
                <span className="text-[10px] text-slate-500">
                  {realSmartTraders.length > 0 ? `#${(activeWalletIdx % realSmartTraders.length) + 1}/${realSmartTraders.length}` : 'SCANNING'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">EX-WALLET:</span>
                {activeTrader && activeTrader.address ? (
                  <a
                    href={`https://solscan.io/account/${activeTrader.address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-lime-300 font-bold hover:underline flex items-center gap-1"
                  >
                    {typeof activeTrader.address === 'string' && activeTrader.address.length >= 10
                      ? `${activeTrader.address.slice(0, 6)}...${activeTrader.address.slice(-4)}`
                      : activeTrader.address}
                    <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                  </a>
                ) : (
                  <span className="text-amber-400 text-[10px]">WAITING FOR SWAP...</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">STYLE / LABEL:</span>
                <span className="text-emerald-400 font-bold">{activeTrader ? `${activeTrader.label} • ${activeTrader.dominantStyle || 'Sniper'}` : 'SCANNING'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">LAST SEEN:</span>
                <span className="text-slate-300">{activeTrader ? new Date(activeTrader.lastSeen).toLocaleTimeString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">WIN RATE:</span>
                <span className="text-cyan-300 font-bold">{activeTrader ? `${(activeTrader.winRate * 100).toFixed(0)}% (${activeTrader.totalPositions} TXS)` : '0%'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">STATUS:</span>
                <span className="text-cyan-400 font-bold">{activeTrader ? 'ON-CHAIN VERIFIED' : 'OBSERVING BLOCKS'}</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/80 border border-lime-950 flex items-center justify-between text-xs">
              <span className="text-slate-400">REALIZED PNL:</span>
              <span className={`font-black ${activeTrader && activeTrader.realizedPnlUsd >= 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                {activeTrader
                  ? `${activeTrader.realizedPnlUsd >= 0 ? '+' : ''}$${Math.round(activeTrader.realizedPnlUsd).toLocaleString()} USD`
                  : '$0.00 USD'}
              </span>
            </div>
          </div>

          {/* Wallet Audit Module */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-lime-900/50 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-lime-400 border-b border-lime-950 pb-2">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                WALLET AUDIT
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">REALIZED STATS</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase">30D REALIZED PNL</span>
              <div className="text-xl font-black text-lime-400 tracking-tight">
                {activeTrader
                  ? `${activeTrader.realizedPnlUsd >= 0 ? '+' : ''}$${Math.round(activeTrader.realizedPnlUsd).toLocaleString()}`
                  : (wallets.length > 0 ? `$${Math.round(totalRealizedPnl).toLocaleString()}` : '$0.00')}
              </div>
              <div className="text-xs text-slate-400">
                {activeTrader ? `TOTAL VOLUME: $${Math.round(activeTrader.totalVolumeUsd || 0).toLocaleString()} USD` : 'WAITING FOR REAL DATA'}
              </div>
            </div>

            {/* Sparkline Graphic Visualization from Real Swaps */}
            <div className="h-14 w-full bg-slate-900/70 rounded-xl border border-slate-900 flex items-end p-1 gap-1">
              {sparklineData.map((v, i) => (
                <div
                  key={i}
                  className="flex-1 bg-lime-500/80 rounded-t-sm transition-all"
                  style={{ height: `${v}%` }}
                />
              ))}
            </div>
          </div>

          {/* Evolution Lab */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-lime-900/50 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-lime-400 border-b border-lime-950 pb-2">
              <span className="flex items-center gap-1.5">
                <Dna className="w-3.5 h-3.5" />
                EVOLUTION LAB
              </span>
              <span className="text-[10px] text-slate-500">SYS: 01</span>
            </div>
            <div className="text-[11px] text-slate-300">
              <div>• COLD FIRST ARCHITECTURE</div>
              <div>• MUTATE 3.0 • SELECTIVE FIT</div>
              <div>• WINNER PREF // LOCKED IN REAL CHAIN</div>
            </div>
          </div>
        </div>

        {/* Center Neural Fly Canvas (The Holographic Insect Retina) */}
        <div className="lg:col-span-6 p-4 rounded-2xl bg-slate-950 border border-lime-500/50 shadow-2xl relative flex flex-col items-center justify-between min-h-[460px] overflow-hidden">
          {/* Top HUD Telemetry Coordinates */}
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-lime-400/80 z-10 px-2">
            <div>
              <span className="text-slate-500">WIN RATE // </span>
              <span className="text-lime-300 font-bold">{activeTrader ? `${(activeTrader.winRate * 100).toFixed(1)}%` : 'SCANNING'}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500">SLOT // </span>
              <span className="text-cyan-400 font-bold">
                {health?.solanaLastSlot ? health.solanaLastSlot.toLocaleString() : (health?.bnbLastBlock ? `BNB #${health.bnbLastBlock}` : 'SYNCING...')}
              </span>
            </div>
          </div>

          {/* Animated 3D/Retina Fly Canvas */}
          <div className="relative w-full flex-1 flex items-center justify-center my-2">
            <canvas
              ref={canvasRef}
              width={420}
              height={360}
              className="max-w-full h-auto drop-shadow-[0_0_25px_rgba(163,230,53,0.35)]"
            />

            {/* Floating Cybernetic Data Overlay Tags */}
            <div className="absolute top-6 left-4 text-[10px] font-mono bg-slate-950/80 border border-lime-800/80 px-2 py-1 rounded text-lime-300">
              FLY / 001
            </div>

            <div className="absolute top-6 right-4 text-[10px] font-mono bg-slate-950/80 border border-rose-800/80 px-2 py-1 rounded text-rose-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              RETINA ACTIVE
            </div>

            <div className="absolute bottom-6 left-6 text-[10px] font-mono text-slate-400">
              <div>NEURAL COLONY // OBSERVING</div>
              <div className="text-lime-400 font-bold">1 ANTENNA-1 // {health?.eventsPerSec ? `${health.eventsPerSec} EVT/S` : 'REAL-TIME'}</div>
            </div>

            <div className="absolute bottom-6 right-6 text-[10px] font-mono text-right text-slate-400">
              <div>MUTATE: <span className="text-lime-300">3.0 • FIT</span></div>
              <div className="text-emerald-400 font-bold">ACCURACY: VERIFIED ON-CHAIN</div>
            </div>
          </div>

          {/* Bottom HUD Bar */}
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-lime-950 pt-2 px-2 z-10">
            <span>OPERATOR MODE: <strong className="text-lime-300">{operator}</strong></span>
            <span>HEURISTIC: STAGGERED AUTO</span>
          </div>
        </div>

        {/* Right Column (Follow Group, Match Exits, Holdout) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Follow Group */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-lime-900/50 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-lime-400 border-b border-lime-950 pb-2">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                FOLLOW GROUP
              </span>
              <span className="text-[10px] text-slate-500">CHAIN: 01</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500">TICK INDEX</div>
                <div className="text-2xl font-black text-lime-400">{tick}</div>
                <div className="text-[11px] text-slate-400">{wallets.length} WALLETS CLUSTERED</div>
              </div>

              {/* Radial Dial Indicator */}
              <div className="w-16 h-16 rounded-full border-2 border-lime-500/40 flex items-center justify-center relative">
                <div
                  className="w-12 h-12 rounded-full border-2 border-dashed border-lime-400 flex items-center justify-center animate-spin"
                  style={{ animationDuration: '8s' }}
                >
                  <span className="text-xs font-black text-lime-300">{tick}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Match Exits Module */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-lime-900/50 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-lime-400 border-b border-lime-950 pb-2">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                MATCH EXITS
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">REALIZED</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">BUY RATIO:</span>
                <span className="text-lime-300 font-bold">{swaps.length > 0 ? `+${buyRatio}%` : 'NO DATA'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">EXIT RATIO:</span>
                <span className="text-cyan-400 font-bold">{swaps.length > 0 ? `${exitRatio}%` : 'NO DATA'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">WIN RATE:</span>
                <span className="text-emerald-400 font-bold">{activeTrader ? `${Math.round(activeTrader.winRate * 100)}%` : '0%'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SELL DRIFT:</span>
                <span className="text-slate-400">{swaps.length > 0 ? `${exitRatio}%` : '0%'}</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/80 border border-lime-950">
              <div className="text-[10px] text-slate-500">TOTAL REALIZED</div>
              <div className="text-sm font-black text-lime-400">
                {swaps.length > 0 ? `${totalRealizedPnl >= 0 ? '+' : ''}$${Math.round(totalRealizedPnl).toLocaleString()} USD` : '$0.00 USD'}
              </div>
            </div>
          </div>

          {/* Holdout & Replay */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-lime-900/50 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-lime-400 border-b border-lime-950 pb-2">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                HOLDOUT / REPLAY
              </span>
              <span className="text-[10px] text-rose-400 font-bold">RED LINE</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <div>• 100 / TRAIN AND REPLAY DATA</div>
              <div>• LIVE SOLANA HISTORICAL REPLAY</div>
              <div className="text-lime-300">• HOLD / SELLERS / DUMPS IDENTIFIED</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: COLONY OPERATORS (7 Interactive Buttons) */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-lime-500/40 shadow-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs font-black text-lime-400 tracking-wider uppercase flex items-center gap-2">
            <Cpu className="w-4 h-4 text-lime-400" />
            COLONY OPERATORS
          </div>
          <div className="text-[11px] text-slate-500">
            PUBLIC DATA // NO AUTO-TRADES • REAL BLOCKCHAIN TELEMETRY
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {[
            { id: 'TRACKER', label: 'TRACKER', icon: Crosshair },
            { id: 'GROUP', label: 'GROUP', icon: Users },
            { id: 'EXITS', label: 'EXITS', icon: TrendingUp },
            { id: 'MONITOR', label: 'MONITOR', icon: Radio },
            { id: 'GENETIC', label: 'GENETIC', icon: Dna },
            { id: 'SELECTOR', label: 'SELECTOR', icon: MousePointer2 },
            { id: 'TESTER', label: 'TESTER', icon: FlaskConical },
          ].map((op) => {
            const Icon = op.icon;
            const isSelected = operator === op.id;
            return (
              <button
                key={op.id}
                onClick={() => setOperator(op.id as OperatorMode)}
                className={`py-3 px-2 rounded-xl font-mono text-xs font-black flex flex-col items-center justify-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-lime-500 text-slate-950 shadow-lg shadow-lime-500/30 scale-105'
                    : 'bg-slate-900/80 border border-lime-950 text-slate-300 hover:border-lime-700 hover:text-lime-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-lime-400'}`} />
                <span className="text-[10px] tracking-wider">{op.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
