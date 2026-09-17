import React from 'react';
import { BinanceTicker } from '../types';
import { TrendingUp, TrendingDown, Globe, Activity } from 'lucide-react';

interface BinanceTickerFeedProps {
  tickers: BinanceTicker[];
}

export const BinanceTickerFeed: React.FC<BinanceTickerFeedProps> = ({ tickers }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 md:p-4 shadow-lg">
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Globe className="w-4 h-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
            BINANCE API REALTIME FEED
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              MACRO MONITOR
            </span>
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
          Live Orderbook &amp; 24h Tickers
        </span>
      </div>

      {tickers.length === 0 ? (
        <div className="py-4 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-lg">
          DATA SOURCE OFFLINE • WAITING FOR REAL DATA
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tickers.map((t) => {
            const isPos = t.change24h >= 0;
            return (
              <div
                key={t.symbol}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-extrabold font-mono text-slate-200">
                    {t.symbol.replace('USDT', '/USDT')}
                  </span>
                  <span
                    className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded flex items-center gap-0.5 ${
                      isPos
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {isPos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {isPos ? '+' : ''}
                    {t.change24h.toFixed(2)}%
                  </span>
                </div>

                <div className="text-base font-black font-mono text-slate-100">
                  ${t.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-1">
                  <span>Vol: ${(t.volume24h / 1e6).toFixed(1)}M</span>
                  <span>H: ${t.high24h > 1000 ? Math.round(t.high24h) : t.high24h.toFixed(1)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
