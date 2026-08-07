import type { Edge, Node } from "@xyflow/react";
import { NODE_DEFINITIONS } from "@/config/flow-node-definitions";
import {
  AIFlowNodeType,
  NodeExecutionStatus,
  ReactFlowNodeKind,
  type AIFlowNodeData,
  type BackendFlowEdge,
  type BackendFlowGraph,
  type BackendFlowNode,
} from "@/schemas/flow-node.schema";

export type AIFlowNode = Node<AIFlowNodeData, typeof ReactFlowNodeKind.AiFlowNode>;

const NODE_TYPE_VALUES = new Set<string>(Object.values(AIFlowNodeType));

function assertNodeType(value: string): AIFlowNodeType {
  if (!NODE_TYPE_VALUES.has(value)) {
    throw new Error(`Unknown flow node type: ${value}`);
  }
  return value as AIFlowNodeType;
}

let nodeSeq = 0;

export function createFlowNode(
  type: AIFlowNodeType,
  position: { x: number; y: number },
  overrides?: Partial<Pick<AIFlowNodeData, "label" | "status">>,
): AIFlowNode {
  const def = NODE_DEFINITIONS[type];
  nodeSeq += 1;

  const fields = def.defaultFields.map((field) => ({ ...field }));
  const config: Record<string, unknown> = { ...def.defaultConfig };
  for (const field of fields) {
    config[field.key] = field.value;
  }

  return {
    id: `${type}-${Date.now()}-${nodeSeq}`,
    type: ReactFlowNodeKind.AiFlowNode,
    position,
    data: {
      label: overrides?.label ?? def.label,
      type,
      description: def.description,
      category: def.category,
      status: overrides?.status ?? NodeExecutionStatus.Idle,
      fields,
      config,
    },
  };
}

export function createDefaultChatFlow(): {
  nodes: AIFlowNode[];
  edges: Edge[];
} {
  const input = createFlowNode(AIFlowNodeType.ChatInput, { x: 80, y: 200 }, {
    label: "User Input",
  });
  const llm = createFlowNode(AIFlowNodeType.OpenAiLlm, { x: 420, y: 180 }, {
    label: "Generate Answer",
  });
  const output = createFlowNode(AIFlowNodeType.ChatOutput, { x: 780, y: 200 }, {
    label: "Response",
  });

  return {
    nodes: [input, llm, output],
    edges: [
      {
        id: "e-input-llm",
        source: input.id,
        target: llm.id,
        sourceHandle: "message",
        targetHandle: "message",
      },
      {
        id: "e-llm-output",
        source: llm.id,
        target: output.id,
        sourceHandle: "response",
        targetHandle: "response",
      },
    ],
  };
}

export function toBackendNode(node: AIFlowNode): BackendFlowNode {
  const config: Record<string, unknown> = {};
  for (const field of node.data.fields) {
    config[field.key] = field.value;
  }

  return {
    id: node.id,
    type: node.data.type,
    position: node.position,
    data: {
      type: node.data.type,
      label: node.data.label,
      ...config,
    },
  };
}

export function toBackendGraph(
  nodes: AIFlowNode[],
  edges: Edge[],
): BackendFlowGraph {
  return {
    nodes: nodes.map(toBackendNode),
    edges: edges.map(
      ({ id, source, target, sourceHandle, targetHandle }): BackendFlowEdge => ({
        id,
        source,
        target,
        ...(sourceHandle ? { sourceHandle } : {}),
        ...(targetHandle ? { targetHandle } : {}),
      }),
    ),
  };
}

export function fromBackendNode(backendNode: BackendFlowNode): AIFlowNode {
  const type = assertNodeType(backendNode.type);
  const def = NODE_DEFINITIONS[type];
  const payload = backendNode.data;

  const fields = def.defaultFields.map((field) => ({
    ...field,
    value:
      (payload[field.key] as string | number | boolean | undefined) ??
      field.value,
  }));

  return {
    id: backendNode.id,
    type: ReactFlowNodeKind.AiFlowNode,
    position: backendNode.position,
    data: {
      label: typeof payload.label === "string" ? payload.label : def.label,
      type,
      description: def.description,
      category: def.category,
      status: NodeExecutionStatus.Idle,
      fields,
      config: { ...def.defaultConfig, ...payload },
    },
  };
}

export function fromBackendGraph(graph: BackendFlowGraph): {
  nodes: AIFlowNode[];
  edges: Edge[];
} {
  return {
    nodes: graph.nodes.map(fromBackendNode),
    edges: graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    })),
  };
}
