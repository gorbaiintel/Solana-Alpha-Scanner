import React, { useState } from 'react';
import {
  Search,
  Plus,
  FileText,
  Braces,
  FormInput,
  Sparkles,
  FileSearch,
  Tag,
  Binary,
  Code2,
  Workflow,
  Type,
  GitBranch,
  Calculator,
  Globe,
  Terminal,
  Code,
  Layout,
  Table,
  ChevronRight,
  ChevronDown,
  Info,
} from 'lucide-react';
import { NODE_DEFINITIONS } from '../data/nodeDefinitions';
import { NodeCategory, NodeType, NodeTypeDefinition } from '../types';

interface NodeSidebarProps {
  onAddNode: (type: NodeType, x?: number, y?: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const CATEGORY_META: Record<NodeCategory, { label: string; color: string; bg: string }> = {
  input: { label: 'Input & Triggers', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ai: { label: 'Gemini AI Engines', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  logic: { label: 'Logic & Code', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  network: { label: 'Network & API', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  output: { label: 'Visualization & Output', color: 'text-rose-400', bg: 'bg-rose-500/10' },
};

export const getIconComponent = (iconName: string) => {
  const map: Record<string, React.ReactNode> = {
    FileText: <FileText className="w-4 h-4" />,
    Braces: <Braces className="w-4 h-4" />,
    FormInput: <FormInput className="w-4 h-4" />,
    Sparkles: <Sparkles className="w-4 h-4" />,
    FileSearch: <FileSearch className="w-4 h-4" />,
    Tag: <Tag className="w-4 h-4" />,
    Binary: <Binary className="w-4 h-4" />,
    Code2: <Code2 className="w-4 h-4" />,
    Workflow: <Workflow className="w-4 h-4" />,
    Type: <Type className="w-4 h-4" />,
    GitBranch: <GitBranch className="w-4 h-4" />,
    Calculator: <Calculator className="w-4 h-4" />,
    Globe: <Globe className="w-4 h-4" />,
    Terminal: <Terminal className="w-4 h-4" />,
    Code: <Code className="w-4 h-4" />,
    Layout: <Layout className="w-4 h-4" />,
    Table: <Table className="w-4 h-4" />,
  };
  return map[iconName] || <Workflow className="w-4 h-4" />;
};

export const NodeSidebar: React.FC<NodeSidebarProps> = ({ onAddNode, isOpen, onToggle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filteredNodes = NODE_DEFINITIONS.filter(
    (def) =>
      def.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories: NodeCategory[] = ['input', 'ai', 'logic', 'network', 'output'];

  return (
    <aside
      className={`bg-slate-900/95 border-r border-slate-800 text-slate-200 flex flex-col transition-all duration-300 z-10 ${
        isOpen ? 'w-72' : 'w-12'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        {isOpen && (
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Node Palette
          </span>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {!isOpen ? (
        <div className="flex flex-col items-center py-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat}
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${CATEGORY_META[cat].bg} ${CATEGORY_META[cat].color}`}
              title={CATEGORY_META[cat].label}
            >
              {getIconComponent(
                cat === 'input'
                  ? 'FileText'
                  : cat === 'ai'
                  ? 'Sparkles'
                  : cat === 'logic'
                  ? 'Code2'
                  : cat === 'network'
                  ? 'Globe'
                  : 'Layout'
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 flex-1 overflow-y-auto space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700"
            />
          </div>

          {/* Node Categories */}
          {categories.map((category) => {
            const categoryNodes = filteredNodes.filter((def) => def.category === category);
            if (categoryNodes.length === 0) return null;

            const isCollapsed = collapsedCategories[category];
            const meta = CATEGORY_META[category];

            return (
              <div key={category} className="space-y-1.5">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between text-xs font-medium text-slate-300 py-1 px-1 hover:text-white transition-colors"
                >
                  <span className={`flex items-center gap-1.5 ${meta.color}`}>
                    {meta.label}
                  </span>
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </button>

                {!isCollapsed && (
                  <div className="space-y-1.5 pl-1">
                    {categoryNodes.map((def) => (
                      <div
                        key={def.type}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/json', JSON.stringify({ type: def.type }));
                        }}
                        onClick={() => onAddNode(def.type)}
                        className="group p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50 cursor-pointer transition-all flex items-center justify-between shadow-sm"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`p-1.5 rounded-md ${meta.bg} ${meta.color} group-hover:scale-105 transition-transform`}
                          >
                            {getIconComponent(def.iconName)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                              {def.label}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate max-w-[170px]">
                              {def.description}
                            </p>
                          </div>
                        </div>

                        <button
                          title="Add Node to Canvas"
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded text-slate-300 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-1.5">
            <div className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <p>Drag nodes onto the canvas or click <Plus className="w-3 h-3 inline" /> to insert.</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
