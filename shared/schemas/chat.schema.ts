import type { Optional } from 'sequelize';

export type RuntimeSessionStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface ChatFlowAttributes {
  id: number;
  name: string;
  description?: string | null;
  flow_data: Record<string, unknown>;
  deployed: boolean;
  is_public: boolean;
  author_id: number;
  workspace_id: number;
  chatbot_config?: Record<string, unknown> | null;
  runtime_config?: Record<string, unknown> | null;
}

export interface ChatFlowCreationAttributes
  extends Optional<
    ChatFlowAttributes,
    | 'id'
    | 'description'
    | 'flow_data'
    | 'deployed'
    | 'is_public'
    | 'chatbot_config'
    | 'runtime_config'
  > {}

export interface RuntimeSessionAttributes {
  id: string;
  flow_id: number;
  user_id: string;
  inputs?: Record<string, unknown> | null;
  variables?: Record<string, unknown> | null;
  outputs?: Record<string, unknown> | null;
  status: RuntimeSessionStatus;
  metadata?: Record<string, unknown> | null;
  started_at: Date;
  completed_at?: Date | null;
}

export interface RuntimeSessionCreationAttributes
  extends Optional<
    RuntimeSessionAttributes,
    | 'id'
    | 'inputs'
    | 'variables'
    | 'outputs'
    | 'metadata'
    | 'completed_at'
  > {}

export interface FlowVersionAttributes {
  id: string;
  flow_id: number;
  data: Record<string, unknown>;
  inputs?: Record<string, unknown> | null;
  author: string;
  comment?: string | null;
  version_number: number;
}

export interface FlowVersionCreationAttributes
  extends Optional<
    FlowVersionAttributes,
    'id' | 'inputs' | 'comment'
  > {}

export interface NodeExecutionAttributes {
  id: number;
  session_id: string;
  node_id: string;
  node_type: string;
  inputs?: Record<string, unknown> | null;
  outputs?: Record<string, unknown> | null;
  execution_time?: number | null;
  status: string;
  error?: string | null;
  timestamp: Date;
}

export interface NodeExecutionCreationAttributes
  extends Optional<
    NodeExecutionAttributes,
    'id' | 'inputs' | 'outputs' | 'execution_time' | 'error'
  > {}

export interface ChatMessageAttributes {
  id: number;
  session_id: string;
  chatflow_id: number;
  role: string;
  content: string;
  source_documents?: Record<string, unknown>[] | null;
  file_annotations?: Record<string, unknown>[] | null;
}

export interface ChatMessageCreationAttributes
  extends Optional<
    ChatMessageAttributes,
    'id' | 'source_documents' | 'file_annotations'
  > {}
