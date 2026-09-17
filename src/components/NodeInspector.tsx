import React, { useState } from 'react';
import {
  X,
  Sliders,
  Terminal,
  Activity,
  Code2,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { FlowNode, NodeState } from '../types';

interface NodeInspectorProps {
  node: FlowNode | null;
  onClose: () => void;
  onUpdateLabel: (id: string, label: string) => void;
  onUpdateConfig: (id: string, config: Record<string, any>) => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  node,
  onClose,
  onUpdateLabel,
  onUpdateConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'payload' | 'ports'>('config');
  const [copied, setCopied] = useState(false);

  if (!node) return null;

  const handleCopyPayload = (obj: any) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 text-slate-200 flex flex-col h-full z-20 shadow-2xl">
      {/* Drawer Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Node Inspector</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-800 text-xs font-medium bg-slate-900">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex-1 py-2 text-center border-b-2 transition-colors ${
            activeTab === 'config'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Configuration
        </button>
        <button
          onClick={() => setActiveTab('payload')}
          className={`flex-1 py-2 text-center border-b-2 transition-colors ${
            activeTab === 'payload'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Data Payload
        </button>
        <button
          onClick={() => setActiveTab('ports')}
          className={`flex-1 py-2 text-center border-b-2 transition-colors ${
            activeTab === 'ports'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Ports
        </button>
      </div>

      {/* Inspector Body Content */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* TAB 1: CONFIGURATION */}
        {activeTab === 'config' && (
          <div className="space-y-4">
            {/* Node Label */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Node Title / Label
              </label>
              <input
                type="text"
                value={node.label}
                onChange={(e) => onUpdateLabel(node.id, e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-slate-700"
              />
            </div>

            {/* Node Type Specific Inputs */}

            {/* Gemini AI Configs */}
            {node.type === 'ai_gemini_prompt' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    System Instruction
                  </label>
                  <textarea
                    value={node.config.systemInstruction || ''}
                    onChange={(e) =>
                      onUpdateConfig(node.id, { ...node.config, systemInstruction: e.target.value })
                    }
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-slate-700 font-sans"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Prompt Template (supports {'{{prompt}}'} and {'{{context}}'})
                  </label>
                  <textarea
                    value={node.config.promptTemplate || ''}
                    onChange={(e) =>
                      onUpdateConfig(node.id, { ...node.config, promptTemplate: e.target.value })
                    }
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-slate-700 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Code JS Configs */}
            {node.type === 'code_js' && (
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Server JavaScript Runner Script
                </label>
                <p className="text-[10px] text-slate-500 mb-2">
                  Access incoming data via <code className="text-emerald-400">input</code> object.
                </p>
                <textarea
                  value={node.config.code || ''}
                  onChange={(e) => onUpdateConfig(node.id, { ...node.config, code: e.target.value })}
                  rows={10}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-emerald-400 font-mono focus:outline-none focus:border-slate-700 leading-relaxed"
                />
              </div>
            )}

            {/* HTTP Request Configs */}
            {node.type === 'http_request' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    HTTP Request Method
                  </label>
                  <select
                    value={node.config.method || 'GET'}
                    onChange={(e) => onUpdateConfig(node.id, { ...node.config, method: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    API Target Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={node.config.url || ''}
                    onChange={(e) => onUpdateConfig(node.id, { ...node.config, url: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Headers (JSON format)
                  </label>
                  <textarea
                    value={node.config.headers || '{}'}
                    onChange={(e) => onUpdateConfig(node.id, { ...node.config, headers: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-slate-700 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Text Formatter Configs */}
            {node.type === 'text_formatter' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Formatting Operation
                  </label>
                  <select
                    value={node.config.operation || 'template'}
                    onChange={(e) => onUpdateConfig(node.id, { ...node.config, operation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                  >
                    <option value="template">Template String</option>
                    <option value="uppercase">Uppercase</option>
                    <option value="lowercase">Lowercase</option>
                    <option value="join">Join String A & B</option>
                  </select>
                </div>

                {node.config.operation === 'template' && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Template Format (use {'{{textA}}'} and {'{{textB}}'})
                    </label>
                    <textarea
                      value={node.config.template || ''}
                      onChange={(e) =>
                        onUpdateConfig(node.id, { ...node.config, template: e.target.value })
                      }
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-slate-700 font-mono"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Condition Filter Configs */}
            {node.type === 'filter_condition' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Condition Operator
                  </label>
                  <select
                    value={node.config.operator || 'equals'}
                    onChange={(e) => onUpdateConfig(node.id, { ...node.config, operator: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                  >
                    <option value="equals">Equals (==)</option>
                    <option value="contains">Contains Substring</option>
                    <option value="greaterThan">Greater Than (&gt;)</option>
                    <option value="notEmpty">Is Not Empty</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Comparison Value
                  </label>
                  <input
                    type="text"
                    value={node.config.compareValue || ''}
                    onChange={(e) =>
                      onUpdateConfig(node.id, { ...node.config, compareValue: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
                  />
                </div>
              </div>
            )}

            {/* JSON Path Extractor */}
            {node.type === 'json_path' && (
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Target Object Key / Path
                </label>
                <input
                  type="text"
                  value={node.config.path || ''}
                  onChange={(e) => onUpdateConfig(node.id, { ...node.config, path: e.target.value })}
                  placeholder="e.g. items or user.address.city"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700 font-mono"
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DATA PAYLOAD */}
        {activeTab === 'payload' && (
          <div className="space-y-4">
            {/* Execution Meta */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Status:</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1 capitalize">
                  {node.state.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {node.state.status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
                  {node.state.status}
                </span>
              </div>
              {node.state.executionTimeMs !== undefined && (
                <div className="flex items-center justify-between text-slate-400">
                  <span>Execution Time:</span>
                  <span className="font-mono text-emerald-400">{node.state.executionTimeMs} ms</span>
                </div>
              )}
            </div>

            {/* Output Payload Tree */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-400">Output Data Payload</span>
                {node.state.outputData && (
                  <button
                    onClick={() => handleCopyPayload(node.state.outputData)}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy JSON'}
                  </button>
                )}
              </div>
              <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-400/90 max-h-64 overflow-auto leading-relaxed">
                {node.state.outputData
                  ? JSON.stringify(node.state.outputData, null, 2)
                  : 'No execution output produced yet.'}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: PORTS */}
        {activeTab === 'ports' && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="text-[11px] font-semibold text-slate-400 uppercase mb-2">Input Ports</h3>
              <div className="space-y-1.5">
                {node.inputs.map((p) => (
                  <div
                    key={p.id}
                    className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <span className="font-medium text-slate-200">{p.name}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {p.dataType}
                    </span>
                  </div>
                ))}
                {node.inputs.length === 0 && <p className="text-slate-500 text-xs">No input ports.</p>}
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold text-slate-400 uppercase mb-2">Output Ports</h3>
              <div className="space-y-1.5">
                {node.outputs.map((p) => (
                  <div
                    key={p.id}
                    className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <span className="font-medium text-slate-200">{p.name}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {p.dataType}
                    </span>
                  </div>
                ))}
                {node.outputs.length === 0 && <p className="text-slate-500 text-xs">No output ports.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
