/**
 * Flow node domain schemas.
 * Uses const objects (erasable) instead of TS enums for Vite `erasableSyntaxOnly`.
 */

export const AIFlowNodeType = {
  ChatInput: "chat_input",
  ChatOutput: "chat_output",
  OpenAiLlm: "openai_llm",
  AnthropicLlm: "anthropic_llm",
  ChromaRetriever: "chroma_retriever",
  PineconeRetriever: "pinecone_retriever",
  PythonTool: "python_tool",
  HttpTool: "http_tool",
  TextSplitter: "text_splitter",
  TextCombiner: "text_combiner",
  Conditional: "conditional",
} as const;

export type AIFlowNodeType =
  (typeof AIFlowNodeType)[keyof typeof AIFlowNodeType];

export const AIFlowNodeCategory = {
  Input: "input",
  Output: "output",
  Llm: "llm",
  Retrieval: "retrieval",
  Tools: "tools",
  Processing: "processing",
} as const;

export type AIFlowNodeCategory =
  (typeof AIFlowNodeCategory)[keyof typeof AIFlowNodeCategory];

export const NodeFieldType = {
  Text: "text",
  Textarea: "textarea",
  Select: "select",
  Number: "number",
  Toggle: "toggle",
} as const;

export type NodeFieldType =
  (typeof NodeFieldType)[keyof typeof NodeFieldType];

export const NodeExecutionStatus = {
  Idle: "idle",
  Running: "running",
  Success: "success",
  Error: "error",
} as const;

export type NodeExecutionStatus =
  (typeof NodeExecutionStatus)[keyof typeof NodeExecutionStatus];

export const ReactFlowNodeKind = {
  AiFlowNode: "aiFlowNode",
} as const;

export type ReactFlowNodeKind =
  (typeof ReactFlowNodeKind)[keyof typeof ReactFlowNodeKind];

export interface NodeFieldOption {
  label: string;
  value: string;
}

export interface NodeField {
  key: string;
  label: string;
  type: NodeFieldType;
  value: string | number | boolean;
  options?: NodeFieldOption[];
  placeholder?: string;
  description?: string;
  required?: boolean;
}

export interface NodePort {
  id: string;
  label: string;
}

/** Canvas node data (React Flow). */
export interface AIFlowNodeData {
  label: string;
  type: AIFlowNodeType;
  description: string;
  category: AIFlowNodeCategory;
  status: NodeExecutionStatus;
  fields: NodeField[];
  config: Record<string, unknown>;
  [key: string]: unknown;
}

/** Persisted node shape expected by AI engine / ChatFlow.flow_data. */
export interface BackendFlowNode {
  id: string;
  type: AIFlowNodeType;
  position: { x: number; y: number };
  data: {
    type: AIFlowNodeType;
    label: string;
    [key: string]: unknown;
  };
}

export interface BackendFlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface BackendFlowGraph {
  nodes: BackendFlowNode[];
  edges: BackendFlowEdge[];
}

export interface NodeDefinition {
  label: string;
  description: string;
  category: AIFlowNodeCategory;
  defaultFields: NodeField[];
  defaultConfig: Record<string, unknown>;
  inputs: NodePort[];
  outputs: NodePort[];
}

export interface NodeCategoryGroup {
  label: string;
  types: AIFlowNodeType[];
}
