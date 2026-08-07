import {
  Background,
  ConnectionLineType,
  Controls,
  MarkerType,
  ReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
  type NodeMouseHandler,
  type NodeTypes,
} from "@xyflow/react";
import type { MouseEvent as ReactMouseEvent } from "react";
import "@xyflow/react/dist/style.css";
import AIFlowNode from "@/components/flow/nodes/AIFlowNode";
import type { AIFlowNode as AIFlowNodeModel } from "@/lib/flow-node-mapper";

const EDGE_COLOR = "#4a5568";

const nodeTypes: NodeTypes = {
  aiFlowNode: AIFlowNode,
};

const defaultEdgeOptions = {
  type: "smoothstep" as const,
  markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLOR },
  style: { stroke: EDGE_COLOR, strokeWidth: 1.5 },
};

type FlowCanvasProps = {
  nodes: AIFlowNodeModel[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange<AIFlowNodeModel>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeClick: NodeMouseHandler<AIFlowNodeModel>;
  onNodeContextMenu: NodeMouseHandler<AIFlowNodeModel>;
  onPaneClick: () => void;
  onPaneContextMenu: (event: ReactMouseEvent) => void;
};

export function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onNodeContextMenu,
  onPaneClick,
  onPaneContextMenu,
}: FlowCanvasProps) {
  return (
    <div className="relative min-h-0 flex-1">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        colorMode="dark"
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: EDGE_COLOR, strokeWidth: 1.5 }}
        defaultEdgeOptions={defaultEdgeOptions}
        style={{ width: "100%", height: "100%" }}
        className="bg-background"
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        deleteKeyCode={["Backspace", "Delete"]}
        multiSelectionKeyCode="Shift"
        nodesDraggable
        nodesConnectable
        elementsSelectable
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Background gap={20} size={1} color="#1e1e1e" />
        <Controls
          showInteractive={false}
          className="!bottom-3 !left-3 !border-border !bg-card !shadow-none [&>button]:!border-border [&>button]:!bg-card [&>button]:!fill-foreground [&>button:hover]:!bg-muted"
        />
      </ReactFlow>
    </div>
  );
}
