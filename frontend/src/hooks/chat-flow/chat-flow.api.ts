import { apiRequest, apiRequestPaginated } from "@/lib/api-client";
import type {
  ChatFlowDto,
  ChatFlowListParams,
  CreateChatFlowBody,
  CreateFlowVersionBody,
  ExecuteChatFlowBody,
  ExecuteChatFlowResult,
  FlowVersionDto,
  PaginatedResult,
  UpdateChatFlowBody,
} from "@/schemas/chat-flow.schema";
import type { BackendFlowGraph } from "@/schemas/flow-node.schema";

function assertFlowGraph(value: unknown): BackendFlowGraph {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid flow_data from backend");
  }
  const graph = value as BackendFlowGraph;
  if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
    throw new Error("flow_data must include nodes and edges arrays");
  }
  return graph;
}

function normalizeChatFlow(flow: ChatFlowDto): ChatFlowDto {
  return {
    ...flow,
    flow_data: assertFlowGraph(flow.flow_data),
  };
}

export async function listChatFlows(
  params: ChatFlowListParams = {},
): Promise<PaginatedResult<ChatFlowDto>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  const qs = query.toString();
  const result = await apiRequestPaginated<ChatFlowDto>(
    `/api/chat-flows${qs ? `?${qs}` : ""}`,
  );

  return {
    data: result.data.map((flow) => ({
      ...flow,
      // List cards don't require a valid graph; keep raw for display.
      flow_data: flow.flow_data,
    })),
    pagination: result.pagination,
  };
}

export async function fetchChatFlow(flowId: number): Promise<ChatFlowDto> {
  const flow = await apiRequest<ChatFlowDto>(`/api/chat-flows/${flowId}`);
  return normalizeChatFlow(flow);
}

export async function createChatFlow(
  body: CreateChatFlowBody,
): Promise<ChatFlowDto> {
  const flow = await apiRequest<ChatFlowDto>("/api/chat-flows", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return normalizeChatFlow(flow);
}

export async function updateChatFlow(
  flowId: number,
  body: UpdateChatFlowBody,
): Promise<ChatFlowDto> {
  const flow = await apiRequest<ChatFlowDto>(`/api/chat-flows/${flowId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return normalizeChatFlow(flow);
}

export async function deleteChatFlow(flowId: number): Promise<void> {
  await apiRequest<null>(`/api/chat-flows/${flowId}`, {
    method: "DELETE",
  });
}

export async function duplicateChatFlow(flowId: number): Promise<ChatFlowDto> {
  const flow = await apiRequest<ChatFlowDto>(
    `/api/chat-flows/${flowId}/duplicate`,
    { method: "POST" },
  );
  return normalizeChatFlow(flow);
}

export async function deployChatFlow(flowId: number): Promise<ChatFlowDto> {
  return apiRequest<ChatFlowDto>(`/api/chat-flows/${flowId}/deploy`, {
    method: "POST",
  });
}

export async function executeChatFlow(
  flowId: number,
  body: ExecuteChatFlowBody,
): Promise<ExecuteChatFlowResult> {
  return apiRequest<ExecuteChatFlowResult>(`/api/chat/${flowId}/execute`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function createFlowVersion(
  body: CreateFlowVersionBody,
): Promise<FlowVersionDto> {
  return apiRequest<FlowVersionDto>("/api/flow-versions", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listFlowVersions(
  flowId: number,
  params: { page?: number; limit?: number } = {},
): Promise<PaginatedResult<FlowVersionDto>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  query.set("sortBy", "version_number");
  query.set("sortOrder", "DESC");

  return apiRequestPaginated<FlowVersionDto>(
    `/api/flow-versions/flow/${flowId}?${query.toString()}`,
  );
}

export async function fetchLatestFlowVersion(
  flowId: number,
): Promise<FlowVersionDto> {
  return apiRequest<FlowVersionDto>(
    `/api/flow-versions/flow/${flowId}/latest`,
  );
}
