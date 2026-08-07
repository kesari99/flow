import type { ChatFlowListParams } from "@/schemas/chat-flow.schema";

export const chatFlowKeys = {
  all: ["chat-flows"] as const,
  lists: () => [...chatFlowKeys.all, "list"] as const,
  list: (params: ChatFlowListParams) =>
    [...chatFlowKeys.lists(), params] as const,
  detail: (flowId: number) => [...chatFlowKeys.all, "detail", flowId] as const,
  versions: (flowId: number) =>
    [...chatFlowKeys.detail(flowId), "versions"] as const,
  latestVersion: (flowId: number) =>
    [...chatFlowKeys.detail(flowId), "latest-version"] as const,
};
