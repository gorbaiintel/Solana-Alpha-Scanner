import React, { useState } from 'react';
import { AppSettings } from '../types';
import { X, SlidersHorizontal, Save, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (updated: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [activeScore, setActiveScore] = useState(settings.activeScore);
  const [maxSignalAgeSec, setMaxSignalAgeSec] = useState(settings.maxSignalAgeSec);
  const [paperTradeEnabled, setPaperTradeEnabled] = useState(settings.paperTradeEnabled);
  const [paperTradeUsd, setPaperTradeUsd] = useState(settings.paperTradeUsd);
  const [smartMoneyText, setSmartMoneyText] = useState((settings.smartMoney || []).join(', '));
  const [devWalletsText, setDevWalletsText] = useState((settings.devWallets || []).join(', '));
  const [watchProgramsText, setWatchProgramsText] = useState((settings.watchPrograms || []).join(', '));
  const [httpRpc, setHttpRpc] = useState(settings.httpRpc);
  const [wsRpc, setWsRpc] = useState(settings.wsRpc);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      activeScore: Number(activeScore),
      maxSignalAgeSec: Number(maxSignalAgeSec),
      paperTradeEnabled,
      paperTradeUsd: Number(paperTradeUsd),
      smartMoney: smartMoneyText.split(',').map((s) => s.trim()).filter(Boolean),
      devWallets: devWalletsText.split(',').map((s) => s.trim()).filter(Boolean),
      watchPrograms: watchProgramsText.split(',').map((s) => s.trim()).filter(Boolean),
      httpRpc,
      wsRpc,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Scanner Configuration</h2>
              <p className="text-xs text-slate-400">
                Adjust deterministic scoring weights, filters, and RPC endpoints.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Active Score Threshold
              </label>
              <input
                type="number"
                value={activeScore}
                onChange={(e) => setActiveScore(Number(e.target.value))}
                min={1}
                max={100}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Paper Trade USD Size
              </label>
              <input
                type="number"
                value={paperTradeUsd}
                onChange={(e) => setPaperTradeUsd(Number(e.target.value))}
                min={10}
                max={10000}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Smart Money Wallets (Comma separated)
            </label>
            <textarea
              value={smartMoneyText}
              onChange={(e) => setSmartMoneyText(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Dev Creators / Launchpad Wallets
            </label>
            <textarea
              value={devWalletsText}
              onChange={(e) => setDevWalletsText(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Solana HTTP RPC
              </label>
              <input
                type="text"
                value={httpRpc}
                onChange={(e) => setHttpRpc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Solana WebSocket RPC
              </label>
              <input
                type="text"
                value={wsRpc}
                onChange={(e) => setWsRpc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="paperCheck"
                checked={paperTradeEnabled}
                onChange={(e) => setPaperTradeEnabled(e.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
              />
              <label htmlFor="paperCheck" className="text-slate-300 font-medium">
                Enable Automated Paper Trading
              </label>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
            >
              {saved ? <Check className="w-4 h-4 text-emerald-950" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
