import React, { useState } from 'react';
import {
  Terminal,
  X,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { ExecutionLog } from '../types';

interface ExecutionConsoleProps {
  logs: ExecutionLog[];
  onClearLogs: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ExecutionConsole: React.FC<ExecutionConsoleProps> = ({
  logs,
  onClearLogs,
  isOpen,
  onToggle,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (filterType === 'all') return true;
    return log.type === filterType;
  });

  return (
    <div className="bg-slate-950 border-t border-slate-800 text-slate-200 h-64 flex flex-col z-20 shadow-2xl">
      {/* Console Header Bar */}
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Execution Console
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {logs.length} events
            </span>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            {['all', 'info', 'success', 'error'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-0.5 rounded capitalize transition-colors ${
                  filterType === type
                    ? 'bg-slate-800 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearLogs}
            title="Clear Console Logs"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Clear</span>
          </button>
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs Scrollable Stream */}
      <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1.5">
        {filteredLogs.map((log) => {
          const isExpanded = expandedLogId === log.id;

          return (
            <div
              key={log.id}
              className="p-2 rounded bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div
                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] text-slate-500 shrink-0">{log.timestamp}</span>

                  {log.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  {log.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                  {log.type === 'info' && <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  {log.type === 'warn' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}

                  <span className="text-slate-300 truncate font-semibold">[{log.nodeLabel}]</span>
                  <span className="text-slate-400 truncate">{log.message}</span>
                </div>

                {log.data && (
                  <button className="text-[10px] text-slate-500 hover:text-slate-300">
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* Log Payload Details */}
              {isExpanded && log.data && (
                <div className="mt-2 pt-2 border-t border-slate-800">
                  <pre className="p-2 bg-slate-950 rounded text-[10px] text-emerald-400/90 max-h-36 overflow-auto">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="p-6 text-center text-slate-500 text-xs">
            No execution log events recorded. Click "Run Flow" to execute the workflow.
          </div>
        )}
      </div>
    </div>
  );
};
