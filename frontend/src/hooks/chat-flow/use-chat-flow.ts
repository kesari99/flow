import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createChatFlow,
  createFlowVersion,
  deleteChatFlow,
  deployChatFlow,
  duplicateChatFlow,
  executeChatFlow,
  fetchChatFlow,
  fetchLatestFlowVersion,
  listChatFlows,
  listFlowVersions,
  updateChatFlow,
} from "@/hooks/chat-flow/chat-flow.api";
import { chatFlowKeys } from "@/hooks/chat-flow/chat-flow.keys";
import { toastApiError } from "@/lib/toast";
import type {
  ChatFlowListParams,
  CreateChatFlowBody,
  CreateFlowVersionBody,
  ExecuteChatFlowBody,
  UpdateChatFlowBody,
} from "@/schemas/chat-flow.schema";
import type { BackendFlowGraph } from "@/schemas/flow-node.schema";

export function useChatFlowsQuery(params: ChatFlowListParams = {}) {
  return useQuery({
    queryKey: chatFlowKeys.list(params),
    queryFn: () => listChatFlows(params),
  });
}

export function useChatFlowQuery(flowId: number | undefined) {
  return useQuery({
    queryKey: flowId ? chatFlowKeys.detail(flowId) : chatFlowKeys.all,
    queryFn: () => fetchChatFlow(flowId!),
    enabled: typeof flowId === "number",
  });
}

export function useLatestFlowVersionQuery(flowId: number | undefined) {
  return useQuery({
    queryKey: flowId
      ? chatFlowKeys.latestVersion(flowId)
      : [...chatFlowKeys.all, "latest-version"],
    queryFn: () => fetchLatestFlowVersion(flowId!),
    enabled: typeof flowId === "number",
    retry: false,
  });
}

export function useFlowVersionsQuery(flowId: number | undefined) {
  return useQuery({
    queryKey: flowId
      ? chatFlowKeys.versions(flowId)
      : [...chatFlowKeys.all, "versions"],
    queryFn: () => listFlowVersions(flowId!, { limit: 20 }),
    enabled: typeof flowId === "number",
  });
}

export function useCreateChatFlowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateChatFlowBody) => createChatFlow(body),
    onSuccess: (flow) => {
      queryClient.setQueryData(chatFlowKeys.detail(flow.id), flow);
      void queryClient.invalidateQueries({ queryKey: chatFlowKeys.lists() });
      toast.success("Flow created", {
        description: "Version 1 saved",
      });
    },
    onError: (error) => toastApiError(error, "Failed to create flow"),
  });
}

type SaveFlowInput = {
  flowId: number;
  body: UpdateChatFlowBody;
  versionComment?: string;
  author?: string;
};

/** Updates flow_data then creates a new FlowVersion snapshot. */
export function useSaveChatFlowWithVersionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      flowId,
      body,
      versionComment = "Saved from flow builder",
      author = "builder",
    }: SaveFlowInput) => {
      const flow = await updateChatFlow(flowId, body);
      const graph = body.flowData as BackendFlowGraph;
      const version = await createFlowVersion({
        flowId,
        data: graph,
        author,
        comment: versionComment,
      });
      return { flow, version };
    },
    onSuccess: ({ flow, version }) => {
      queryClient.setQueryData(chatFlowKeys.detail(flow.id), flow);
      void queryClient.invalidateQueries({
        queryKey: chatFlowKeys.versions(flow.id),
      });
      void queryClient.invalidateQueries({
        queryKey: chatFlowKeys.latestVersion(flow.id),
      });
      void queryClient.invalidateQueries({ queryKey: chatFlowKeys.lists() });
      toast.success("Flow saved", {
        description: `Version ${version.version_number} created`,
      });
    },
    onError: (error) => toastApiError(error, "Failed to save flow"),
  });
}

export function useUpdateChatFlowMutation(flowId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateChatFlowBody) => updateChatFlow(flowId, body),
    onSuccess: (flow) => {
      queryClient.setQueryData(chatFlowKeys.detail(flow.id), flow);
      void queryClient.invalidateQueries({ queryKey: chatFlowKeys.lists() });
      toast.success("Flow saved");
    },
    onError: (error) => toastApiError(error, "Failed to save flow"),
  });
}

export function useCreateFlowVersionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateFlowVersionBody) => createFlowVersion(body),
    onSuccess: (version) => {
      void queryClient.invalidateQueries({
        queryKey: chatFlowKeys.versions(version.flow_id),
      });
      void queryClient.invalidateQueries({
        queryKey: chatFlowKeys.latestVersion(version.flow_id),
      });
      toast.success(`Version ${version.version_number} created`);
    },
    onError: (error) => toastApiError(error, "Failed to create version"),
  });
}

export function useDeleteChatFlowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flowId: number) => deleteChatFlow(flowId),
    onSuccess: (_data, flowId) => {
      queryClient.removeQueries({ queryKey: chatFlowKeys.detail(flowId) });
      void queryClient.invalidateQueries({ queryKey: chatFlowKeys.lists() });
      toast.success("Flow deleted");
    },
    onError: (error) => toastApiError(error, "Failed to delete flow"),
  });
}

export function useDuplicateChatFlowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flowId: number) => duplicateChatFlow(flowId),
    onSuccess: (flow) => {
      queryClient.setQueryData(chatFlowKeys.detail(flow.id), flow);
      void queryClient.invalidateQueries({ queryKey: chatFlowKeys.lists() });
      toast.success("Flow duplicated");
    },
    onError: (error) => toastApiError(error, "Failed to duplicate flow"),
  });
}

export function useDeployChatFlowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flowId: number) => deployChatFlow(flowId),
    onSuccess: (flow) => {
      queryClient.setQueryData(chatFlowKeys.detail(flow.id), flow);
      void queryClient.invalidateQueries({ queryKey: chatFlowKeys.lists() });
      toast.success("Flow deployed");
    },
    onError: (error) => toastApiError(error, "Failed to deploy flow"),
  });
}

export function useExecuteChatFlowMutation(flowId: number) {
  return useMutation({
    mutationFn: (body: ExecuteChatFlowBody) => executeChatFlow(flowId, body),
    onSuccess: (result) => {
      toast.success("Flow executed", {
        description: result.response.slice(0, 140),
      });
    },
    onError: (error) => toastApiError(error, "Failed to execute flow"),
  });
}
