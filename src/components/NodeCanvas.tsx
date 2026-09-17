import React, { useRef, useState } from 'react';
import { FlowNode, FlowConnection, ExecutionStatus } from '../types';
import { NodeCard } from './NodeCard';

interface NodeCanvasProps {
  nodes: FlowNode[];
  connections: FlowConnection[];
  selectedNodeId: string | null;
  status: ExecutionStatus;
  zoom: number;
  pan: { x: number; y: number };
  onPanChange: (pan: { x: number; y: number }) => void;
  onSelectNode: (id: string | null) => void;
  onMoveNode: (id: string, x: number, y: number) => void;
  onDeleteNode: (id: string) => void;
  onRunSingleNode: (id: string) => void;
  onUpdateNodeConfig: (id: string, config: Record<string, any>) => void;
  onCreateConnection: (fromNodeId: string, fromPortId: string, toNodeId: string, toPortId: string) => void;
  onDeleteConnection: (id: string) => void;
  onAddNodeAtPosition: (type: any, x: number, y: number) => void;
}

export const NodeCanvas: React.FC<NodeCanvasProps> = ({
  nodes,
  connections,
  selectedNodeId,
  status,
  zoom,
  pan,
  onPanChange,
  onSelectNode,
  onMoveNode,
  onDeleteNode,
  onRunSingleNode,
  onUpdateNodeConfig,
  onCreateConnection,
  onDeleteConnection,
  onAddNodeAtPosition,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Wiring Connection Drag State
  const [wireDrag, setWireDrag] = useState<{
    fromNodeId: string;
    fromPortId: string;
    isOutput: boolean;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Active Connection Hover ID
  const [hoveredConnId, setHoveredConnId] = useState<string | null>(null);

  // Pan Canvas Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      onSelectNode(null);
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      onPanChange({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    } else if (draggingNodeId) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - pan.x) / zoom - dragOffset.x;
        const y = (e.clientY - rect.top - pan.y) / zoom - dragOffset.y;
        onMoveNode(draggingNodeId, Math.max(10, x), Math.max(10, y));
      }
    } else if (wireDrag) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const currentX = (e.clientX - rect.left - pan.x) / zoom;
        const currentY = (e.clientY - rect.top - pan.y) / zoom;
        setWireDrag((prev) => (prev ? { ...prev, currentX, currentY } : null));
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
    setWireDrag(null);
  };

  // Node Dragging Start
  const handleNodeMouseDown = (id: string, e: React.MouseEvent) => {
    const node = nodes.find((n) => n.id === id);
    if (node) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = (e.clientX - rect.left - pan.x) / zoom;
        const mouseY = (e.clientY - rect.top - pan.y) / zoom;
        setDraggingNodeId(id);
        setDragOffset({ x: mouseX - node.x, y: mouseY - node.y });
      }
    }
  };

  // Port Connection Start
  const handlePortMouseDown = (nodeId: string, portId: string, isOutput: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Approximate Port Position
    const portX = isOutput ? node.x + 320 : node.x;
    const portY = node.y + 60;

    setWireDrag({
      fromNodeId: nodeId,
      fromPortId: portId,
      isOutput,
      currentX: portX,
      currentY: portY,
    });
  };

  // Port Mouse Up to Complete Connection
  const handlePortMouseUp = (targetNodeId: string, targetPortId: string, isTargetOutput: boolean) => {
    if (wireDrag) {
      if (wireDrag.isOutput !== isTargetOutput && wireDrag.fromNodeId !== targetNodeId) {
        const sourceNodeId = wireDrag.isOutput ? wireDrag.fromNodeId : targetNodeId;
        const sourcePortId = wireDrag.isOutput ? wireDrag.fromPortId : targetPortId;
        const destNodeId = wireDrag.isOutput ? targetNodeId : wireDrag.fromNodeId;
        const destPortId = wireDrag.isOutput ? targetPortId : wireDrag.fromPortId;

        onCreateConnection(sourceNodeId, sourcePortId, destNodeId, destPortId);
      }
    }
    setWireDrag(null);
  };

  // Drag and Drop Node from Palette
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (data) {
      try {
        const { type } = JSON.parse(data);
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const dropX = (e.clientX - rect.left - pan.x) / zoom;
          const dropY = (e.clientY - rect.top - pan.y) / zoom;
          onAddNodeAtPosition(type, Math.max(20, dropX), Math.max(20, dropY));
        }
      } catch (err) {
        console.error('Failed to parse dropped node payload:', err);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Helper to compute port coordinates on Canvas
  const getPortCoordinates = (nodeId: string, portId: string, isOutput: boolean) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };

    const ports = isOutput ? node.outputs : node.inputs;
    const portIndex = ports.findIndex((p) => p.id === portId);
    const indexOffset = portIndex >= 0 ? portIndex * 24 : 0;

    return {
      x: isOutput ? node.x + 320 : node.x,
      y: node.y + 52 + indexOffset,
    };
  };

  // Generate Smooth Bezier Curved Path String
  const generateBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.abs(x2 - x1) * 0.5;
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="relative flex-1 bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing select-none"
      style={{
        backgroundImage: `radial-gradient(#1e293b 1.5px, transparent 1.5px)`,
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* Canvas World Container transformed by Pan & Zoom */}
      <div
        className="absolute inset-0 origin-top-left pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {/* SVG Wire Connections Overlay */}
        <svg className="absolute inset-0 w-[5000px] h-[5000px] overflow-visible pointer-events-none">
          {/* Render Existing Connections */}
          {connections.map((conn) => {
            const start = getPortCoordinates(conn.fromNodeId, conn.fromPortId, true);
            const end = getPortCoordinates(conn.toNodeId, conn.toPortId, false);
            const pathStr = generateBezierPath(start.x, start.y, end.x, end.y);
            const isHovered = hoveredConnId === conn.id;

            return (
              <g key={conn.id} className="pointer-events-auto">
                {/* Thick Invisible Hover Target */}
                <path
                  d={pathStr}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="14"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredConnId(conn.id)}
                  onMouseLeave={() => setHoveredConnId(null)}
                  onClick={() => onDeleteConnection(conn.id)}
                />

                {/* Visible Cable Line */}
                <path
                  d={pathStr}
                  fill="none"
                  stroke={isHovered ? '#f43f5e' : '#10b981'}
                  strokeWidth={isHovered ? '3.5' : '2.5'}
                  className="transition-colors duration-150"
                />

                {/* Flow Execution Particle Effect */}
                {status === 'running' && (
                  <path
                    d={pathStr}
                    fill="none"
                    stroke="#a7f3d0"
                    strokeWidth="3"
                    strokeDasharray="6, 6"
                    className="animate-pulse"
                  />
                )}
              </g>
            );
          })}

          {/* Active Cable Dragging Line */}
          {wireDrag && (
            <path
              d={generateBezierPath(
                wireDrag.isOutput
                  ? getPortCoordinates(wireDrag.fromNodeId, wireDrag.fromPortId, true).x
                  : wireDrag.currentX,
                wireDrag.isOutput
                  ? getPortCoordinates(wireDrag.fromNodeId, wireDrag.fromPortId, true).y
                  : wireDrag.currentY,
                wireDrag.isOutput
                  ? wireDrag.currentX
                  : getPortCoordinates(wireDrag.fromNodeId, wireDrag.fromPortId, false).x,
                wireDrag.isOutput
                  ? wireDrag.currentY
                  : getPortCoordinates(wireDrag.fromNodeId, wireDrag.fromPortId, false).y
              )}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeDasharray="4, 4"
            />
          )}
        </svg>

        {/* Nodes Layer */}
        <div className="pointer-events-auto">
          {nodes.map((node) => (
            <div
              key={node.id}
              onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
              onMouseUp={() => {
                if (wireDrag) {
                  // Find hit input or output port
                  const port =
                    node.inputs[0] || node.outputs[0];
                  if (port) {
                    handlePortMouseUp(node.id, port.id, !wireDrag.isOutput);
                  }
                }
              }}
            >
              <NodeCard
                node={node}
                isSelected={selectedNodeId === node.id}
                onSelect={() => onSelectNode(node.id)}
                onDelete={() => onDeleteNode(node.id)}
                onRunSingle={() => onRunSingleNode(node.id)}
                onUpdateConfig={(cfg) => onUpdateNodeConfig(node.id, cfg)}
                onPortMouseDown={(portId, isOutput, e) =>
                  handlePortMouseDown(node.id, portId, isOutput, e)
                }
                connections={connections}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
