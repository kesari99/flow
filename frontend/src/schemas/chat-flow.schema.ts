import type { BackendFlowGraph } from "@/schemas/flow-node.schema";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  errors: Array<{
    message: string;
    field?: string;
    details?: unknown;
  }>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

/** ChatFlow row as returned by the backend (Sequelize plain). */
export interface ChatFlowDto {
  id: number;
  name: string;
  description: string | null;
  flow_data: BackendFlowGraph;
  deployed: boolean;
  is_public: boolean;
  author_id: number;
  workspace_id: number;
  chatbot_config: Record<string, unknown> | null;
  runtime_config: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateChatFlowBody {
  name: string;
  description?: string;
  flowData: BackendFlowGraph;
  isPublic?: boolean;
}

export interface UpdateChatFlowBody {
  name?: string;
  description?: string | null;
  flowData?: BackendFlowGraph;
  isPublic?: boolean;
}

export interface ExecuteChatFlowBody {
  userMessage: string;
  sessionId?: string;
}

export interface ExecuteChatFlowResult {
  response: string;
  sessionId: string;
  tokens: number;
  metadata: Record<string, unknown>;
}

export interface FlowVersionDto {
  id: string;
  flow_id: number;
  data: BackendFlowGraph | Record<string, unknown>;
  inputs: Record<string, unknown> | null;
  author: string;
  comment: string | null;
  version_number: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFlowVersionBody {
  flowId: number;
  data: BackendFlowGraph;
  author: string;
  comment?: string;
}

export interface ChatFlowListParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}
