import React, { useState } from 'react';
import { X, Download, Upload, Copy, Check, FileCode } from 'lucide-react';
import { FlowNode, FlowConnection } from '../types';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowName: string;
  nodes: FlowNode[];
  connections: FlowConnection[];
  onImportWorkflow: (data: { name: string; nodes: FlowNode[]; connections: FlowConnection[] }) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  workflowName,
  nodes,
  connections,
  onImportWorkflow,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importJsonText, setImportJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const exportedData = JSON.stringify(
    {
      name: workflowName,
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      nodes,
      connections,
    },
    null,
    2
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(exportedData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([exportedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.toLowerCase().replace(/\s+/g, '-')}-workflow.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.connections)) {
        throw new Error('Invalid flow structure. Missing "nodes" or "connections" array.');
      }
      onImportWorkflow({
        name: parsed.name || 'Imported Workflow',
        nodes: parsed.nodes,
        connections: parsed.connections,
      });
      onClose();
    } catch (err: any) {
      setImportError(err.message || 'Failed to parse JSON workflow.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Workflow JSON Manager</h2>
              <p className="text-xs text-slate-400">Export or restore workflow definitions.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 text-center border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Export JSON
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 text-center border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Import JSON
          </button>
        </div>

        {/* Export Content */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="relative">
              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400/90 max-h-60 overflow-auto leading-relaxed">
                {exportedData}
              </pre>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied to Clipboard' : 'Copy Flow JSON'}
              </button>

              <button
                onClick={handleDownload}
                className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                Download JSON File
              </button>
            </div>
          </div>
        )}

        {/* Import Content */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            <textarea
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste workflow JSON content here..."
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700"
            />

            {importError && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono">
                ⚠ {importError}
              </div>
            )}

            <button
              onClick={handleImportSubmit}
              disabled={!importJsonText.trim()}
              className="w-full py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Upload className="w-4 h-4" />
              Load & Render Workflow Canvas
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
