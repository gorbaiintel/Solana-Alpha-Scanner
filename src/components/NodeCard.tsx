import React, { useState } from 'react';
import {
  Play,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { FlowNode, FlowConnection } from '../types';
import { getIconComponent } from './NodeSidebar';

interface NodeCardProps {
  node: FlowNode;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRunSingle: () => void;
  onUpdateConfig: (config: Record<string, any>) => void;
  onPortMouseDown: (portId: string, isOutput: boolean, e: React.MouseEvent) => void;
  connections: FlowConnection[];
}

const PORT_COLOR_MAP: Record<string, string> = {
  string: 'bg-emerald-400 border-emerald-300',
  number: 'bg-amber-400 border-amber-300',
  object: 'bg-cyan-400 border-cyan-300',
  array: 'bg-indigo-400 border-indigo-300',
  boolean: 'bg-rose-400 border-rose-300',
  any: 'bg-slate-300 border-white',
};

const CATEGORY_HEADER_THEMES: Record<string, { border: string; bg: string; badge: string }> = {
  input: { border: 'border-amber-500/40', bg: 'bg-amber-500/10', badge: 'bg-amber-500/20 text-amber-300' },
  ai: { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', badge: 'bg-emerald-500/20 text-emerald-300' },
  logic: { border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', badge: 'bg-cyan-500/20 text-cyan-300' },
  network: { border: 'border-indigo-500/40', bg: 'bg-indigo-500/10', badge: 'bg-indigo-500/20 text-indigo-300' },
  output: { border: 'border-rose-500/40', bg: 'bg-rose-500/10', badge: 'bg-rose-500/20 text-rose-300' },
};

export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onRunSingle,
  onUpdateConfig,
  onPortMouseDown,
}) => {
  const [formInputVal, setFormInputVal] = useState(node.config.defaultValue || '');
  const [isJsonExpanded, setIsJsonExpanded] = useState(true);

  const theme = CATEGORY_HEADER_THEMES[node.category] || CATEGORY_HEADER_THEMES.logic;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({ ...node.config, defaultValue: formInputVal });
    onRunSingle();
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{ left: node.x, top: node.y }}
      className={`absolute w-80 bg-slate-900 rounded-xl border shadow-xl transition-shadow select-none group ${
        isSelected
          ? 'border-emerald-400 ring-2 ring-emerald-400/20 shadow-emerald-500/10'
          : `${theme.border} hover:border-slate-600`
      }`}
    >
      {/* Node Header Bar */}
      <div className={`p-3 rounded-t-xl flex items-center justify-between border-b border-slate-800 ${theme.bg}`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-slate-950/80 text-slate-200">
            {getIconComponent(
              node.category === 'input'
                ? 'FileText'
                : node.category === 'ai'
                ? 'Sparkles'
                : node.category === 'logic'
                ? 'Code2'
                : node.category === 'network'
                ? 'Globe'
                : 'Layout'
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-slate-100 truncate">{node.label}</h3>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-medium uppercase ${theme.badge}`}>
                {node.category}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate font-mono">ID: {node.id}</p>
          </div>
        </div>

        {/* Action Controls & Execution State Badge */}
        <div className="flex items-center gap-1">
          {node.state.status === 'running' && (
            <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          )}
          {node.state.status === 'success' && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
          {node.state.status === 'error' && (
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRunSingle();
            }}
            title="Execute Single Node"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete Node"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Node Body with Input/Output Ports & Dynamic Content */}
      <div className="p-3 space-y-3">
        {/* Ports Container */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Input Ports (Left) */}
          <div className="space-y-2">
            {node.inputs.map((port) => (
              <div key={port.id} className="flex items-center gap-2 relative">
                <div
                  onMouseDown={(e) => onPortMouseDown(port.id, false, e)}
                  title={`Input Port: ${port.name} (${port.dataType})`}
                  className={`w-3.5 h-3.5 rounded-full border-2 cursor-crosshair hover:scale-125 transition-transform -ml-5 shadow-sm ${
                    PORT_COLOR_MAP[port.dataType] || PORT_COLOR_MAP.any
                  }`}
                />
                <span className="text-[11px] font-medium text-slate-300 truncate">{port.name}</span>
                <span className="text-[9px] text-slate-500 font-mono">({port.dataType})</span>
              </div>
            ))}
          </div>

          {/* Output Ports (Right) */}
          <div className="space-y-2 text-right">
            {node.outputs.map((port) => (
              <div key={port.id} className="flex items-center justify-end gap-2 relative">
                <span className="text-[9px] text-slate-500 font-mono">({port.dataType})</span>
                <span className="text-[11px] font-medium text-slate-300 truncate">{port.name}</span>
                <div
                  onMouseDown={(e) => onPortMouseDown(port.id, true, e)}
                  title={`Output Port: ${port.name} (${port.dataType})`}
                  className={`w-3.5 h-3.5 rounded-full border-2 cursor-crosshair hover:scale-125 transition-transform -mr-5 shadow-sm ${
                    PORT_COLOR_MAP[port.dataType] || PORT_COLOR_MAP.any
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Node Specific Controls & Visual Previews */}
        <div className="pt-2 border-t border-slate-800/80">
          {/* Input Text Control */}
          {node.type === 'input_text' && (
            <textarea
              value={node.config.value || ''}
              onChange={(e) => onUpdateConfig({ ...node.config, value: e.target.value })}
              placeholder="Type string content..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700 font-sans"
            />
          )}

          {/* Trigger Form Interactive */}
          {node.type === 'trigger_form' && (
            <form onSubmit={handleFormSubmit} className="space-y-2">
              <input
                type="text"
                value={formInputVal}
                onChange={(e) => setFormInputVal(e.target.value)}
                placeholder={node.config.placeholder || 'Type trigger input...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700"
              />
              <button
                type="submit"
                className="w-full py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Send className="w-3 h-3" />
                Trigger Flow Execution
              </button>
            </form>
          )}

          {/* Output Card Visualizer */}
          {node.type === 'output_card' && (
            <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 truncate">
                  {node.state.outputData?.title || node.config.cardTitle || 'Output Card'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-medium">
                  {node.state.outputData?.badge || 'Render'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans max-h-28 overflow-y-auto">
                {node.state.outputData?.content || 'No output content generated yet.'}
              </p>
            </div>
          )}

          {/* Output Table Visualizer */}
          {node.type === 'output_table' && (
            <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden text-[11px]">
              {Array.isArray(node.state.outputData?.items) && node.state.outputData.items.length > 0 ? (
                <div className="max-h-36 overflow-auto">
                  <table className="w-full text-left text-slate-300 border-collapse">
                    <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0">
                      <tr>
                        {Object.keys(node.state.outputData.items[0] && typeof node.state.outputData.items[0] === 'object' ? node.state.outputData.items[0] : {}).slice(0, 3).map((col) => (
                          <th key={col} className="p-1.5 font-medium truncate">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {(Array.isArray(node.state.outputData.items) ? node.state.outputData.items : []).slice(0, 4).map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-900/50">
                          {Object.keys(row && typeof row === 'object' ? row : {}).slice(0, 3).map((col) => (
                            <td key={col} className="p-1.5 truncate max-w-[80px]">
                              {String(row[col])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-3 text-center text-slate-500 text-xs">
                  Empty table dataset
                </div>
              )}
            </div>
          )}

          {/* Output JSON Tree Visualizer */}
          {(node.type === 'output_json' || node.type === 'output_log') && (
            <div className="bg-slate-950 rounded-lg border border-slate-800 p-2 text-[11px] font-mono text-slate-300">
              <div
                onClick={() => setIsJsonExpanded(!isJsonExpanded)}
                className="flex items-center justify-between cursor-pointer text-slate-400 hover:text-slate-200 mb-1"
              >
                <span>Output Payload</span>
                {isJsonExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </div>
              {isJsonExpanded && (
                <pre className="max-h-28 overflow-auto text-emerald-400/90 text-[10px] leading-tight">
                  {node.state.outputData
                    ? JSON.stringify(node.state.outputData, null, 2)
                    : 'Wait for flow execution...'}
                </pre>
              )}
            </div>
          )}

          {/* AI Gemini Output Preview */}
          {node.category === 'ai' && node.state.outputData && (
            <div className="bg-slate-950/80 rounded-lg border border-emerald-500/20 p-2 text-xs text-slate-300 max-h-24 overflow-y-auto font-sans leading-relaxed">
              <span className="text-[10px] font-mono text-emerald-400 font-semibold block mb-0.5">
                ✦ AI Result Output:
              </span>
              {typeof node.state.outputData.response === 'string'
                ? node.state.outputData.response
                : JSON.stringify(node.state.outputData, null, 2)}
            </div>
          )}

          {/* Error Message Footer */}
          {node.state.error && (
            <div className="mt-2 p-2 rounded bg-rose-950/40 border border-rose-500/40 text-rose-300 text-[11px] font-mono">
              ⚠ Error: {node.state.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
