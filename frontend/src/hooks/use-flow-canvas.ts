import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import { useCallback, useState } from "react";
import { NODE_DEFINITIONS } from "@/config/flow-node-definitions";
import {
  createDefaultChatFlow,
  createFlowNode,
  fromBackendGraph,
  type AIFlowNode,
} from "@/lib/flow-node-mapper";
import type { BackendFlowGraph } from "@/schemas/flow-node.schema";
import {
  AIFlowNodeType,
  type AIFlowNodeData,
} from "@/schemas/flow-node.schema";

export function useFlowCanvas(initialGraph?: BackendFlowGraph) {
  const seed = initialGraph
    ? fromBackendGraph(initialGraph)
    : createDefaultChatFlow();

  const [nodes, setNodes] = useState<AIFlowNode[]>(seed.nodes);
  const [edges, setEdges] = useState<Edge[]>(seed.edges);

  const onNodesChange = useCallback((changes: NodeChange<AIFlowNode>[]) => {
    setNodes((current) => applyNodeChanges(changes, current) as AIFlowNode[]);
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((current) => applyEdgeChanges(changes, current));
  }, []);

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;

    setEdges((current) => {
      const exists = current.some(
        (edge) =>
          edge.source === connection.source &&
          edge.target === connection.target &&
          edge.sourceHandle === connection.sourceHandle &&
          edge.targetHandle === connection.targetHandle,
      );
      if (exists) return current;

      return addEdge(
        {
          ...connection,
          id: `${connection.source}-${connection.target}-${Date.now()}`,
        },
        current,
      );
    });
  }, []);

  const addNode = useCallback(
    (type: AIFlowNodeType, position: { x: number; y: number }) => {
      const node = createFlowNode(type, position);
      setNodes((current) => [...current, node]);
      return node;
    },
    [],
  );

  const changeNodeType = useCallback(
    (nodeId: string, type: AIFlowNodeType) => {
      const def = NODE_DEFINITIONS[type];
      setNodes((current) =>
        current.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  type,
                  label: def.label,
                  description: def.description,
                  category: def.category,
                  fields: def.defaultFields.map((field) => ({ ...field })),
                  config: { ...def.defaultConfig },
                },
              }
            : node,
        ),
      );
    },
    [],
  );

  const updateNodeData = useCallback(
    (nodeId: string, updates: Partial<AIFlowNodeData>) => {
      setNodes((current) =>
        current.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...updates } }
            : node,
        ),
      );
    },
    [],
  );

  const replaceGraph = useCallback((graph: BackendFlowGraph) => {
    const canvas = fromBackendGraph(graph);
    setNodes(canvas.nodes);
    setEdges(canvas.edges);
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((current) => current.filter((node) => node.id !== nodeId));
    setEdges((current) =>
      current.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId,
      ),
    );
  }, []);

  const deleteSelectedNodes = useCallback(() => {
    setNodes((current) => {
      const selectedIds = new Set(
        current.filter((node) => node.selected).map((node) => node.id),
      );
      if (selectedIds.size === 0) return current;

      setEdges((edges) =>
        edges.filter(
          (edge) =>
            !selectedIds.has(edge.source) && !selectedIds.has(edge.target),
        ),
      );
      return current.filter((node) => !selectedIds.has(node.id));
    });
  }, []);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    changeNodeType,
    updateNodeData,
    replaceGraph,
    deleteNode,
    deleteSelectedNodes,
  };
}
