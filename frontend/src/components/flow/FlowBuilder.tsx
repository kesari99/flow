import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReactFlow } from "@xyflow/react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { NodeMouseHandler } from "@xyflow/react";
import { toast } from "sonner";
import { FlowCanvas } from "@/components/flow/FlowCanvas";
import { FlowContextMenu } from "@/components/flow/FlowContextMenu";
import { FlowToolbar } from "@/components/flow/FlowToolbar";
import { NodeConfigPanel } from "@/components/flow/panels/NodeConfigPanel";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useChatFlowQuery,
  useCreateChatFlowMutation,
  useExecuteChatFlowMutation,
  useLatestFlowVersionQuery,
  useSaveChatFlowWithVersionMutation,
} from "@/hooks/chat-flow";
import { useFlowCanvas } from "@/hooks/use-flow-canvas";
import type { AIFlowNode } from "@/lib/flow-node-mapper";
import { toBackendGraph } from "@/lib/flow-node-mapper";
import { toastApiError } from "@/lib/toast";
import type { AIFlowNodeType } from "@/schemas/flow-node.schema";

type FlowBuilderProps = {
  flowId?: number;
};

export function FlowBuilder({ flowId }: FlowBuilderProps) {
  const navigate = useNavigate();
  const { screenToFlowPosition } = useReactFlow();
  const flowQuery = useChatFlowQuery(flowId);
  const latestVersionQuery = useLatestFlowVersionQuery(flowId);
  const createMutation = useCreateChatFlowMutation();
  const saveWithVersionMutation = useSaveChatFlowWithVersionMutation();
  const executeMutation = useExecuteChatFlowMutation(flowId ?? 0);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    changeNodeType,
    updateNodeData,
    replaceGraph,
    deleteNode,
    deleteSelectedNodes,
  } = useFlowCanvas(
    flowId && flowQuery.data ? flowQuery.data.flow_data : undefined,
  );

  const [flowName, setFlowName] = useState("Untitled flow");
  const [testMessage, setTestMessage] = useState("Hello!");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId?: string;
  } | null>(null);
  const [hydratedFlowId, setHydratedFlowId] = useState<number | null>(null);

  useEffect(() => {
    if (!flowQuery.data || !flowId) return;
    if (hydratedFlowId === flowId) return;

    replaceGraph(flowQuery.data.flow_data);
    setFlowName(flowQuery.data.name);
    setHydratedFlowId(flowId);
  }, [flowId, flowQuery.data, hydratedFlowId, replaceGraph]);

  useEffect(() => {
    if (flowQuery.isError) {
      toastApiError(flowQuery.error, "Failed to load flow");
    }
  }, [flowQuery.error, flowQuery.isError]);

  useEffect(() => {
    if (selectedNodeId && !nodes.some((node) => node.id === selectedNodeId)) {
      setSelectedNodeId(null);
    }
  }, [nodes, selectedNodeId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Backspace" && event.key !== "Delete") return;

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (selectedNodeId) {
        event.preventDefault();
        deleteNode(selectedNodeId);
        setSelectedNodeId(null);
        setContextMenu(null);
        return;
      }

      const hasSelected = nodes.some((node) => node.selected);
      if (hasSelected) {
        event.preventDefault();
        deleteSelectedNodes();
        setContextMenu(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteNode, deleteSelectedNodes, nodes, selectedNodeId]);

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      deleteNode(nodeId);
      setSelectedNodeId((current) => (current === nodeId ? null : current));
      setContextMenu(null);
    },
    [deleteNode],
  );

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId),
    [nodes, selectedNodeId],
  );

  const isSaving =
    createMutation.isPending || saveWithVersionMutation.isPending;

  const handleSave = useCallback(async () => {
    const flowData = toBackendGraph(nodes, edges);

    if (flowId) {
      await saveWithVersionMutation.mutateAsync({
        flowId,
        body: {
          name: flowName,
          flowData,
        },
        versionComment: "Saved from flow builder",
        author: "builder",
      });
      return;
    }

    // Backend create already writes version 1.
    const created = await createMutation.mutateAsync({
      name: flowName,
      flowData,
    });
    navigate(`/flows/${created.id}/edit`, { replace: true });
  }, [
    createMutation,
    edges,
    flowId,
    flowName,
    navigate,
    nodes,
    saveWithVersionMutation,
  ]);

  const handleExport = useCallback(() => {
    const flowData = toBackendGraph(nodes, edges);
    const blob = new Blob([JSON.stringify(flowData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${flowName.replace(/\s+/g, "-").toLowerCase()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [edges, flowName, nodes]);

  const handleExecute = useCallback(async () => {
    if (!flowId) {
      toast.error("Save the flow before testing");
      return;
    }

    const result = await executeMutation.mutateAsync({
      userMessage: testMessage,
      sessionId,
    });
    setSessionId(result.sessionId);
  }, [executeMutation, flowId, sessionId, testMessage]);

  const handleAddNode = useCallback(
    (type: AIFlowNodeType) => {
      const position = contextMenu
        ? screenToFlowPosition({ x: contextMenu.x, y: contextMenu.y })
        : { x: 400, y: 200 };
      const node = addNode(type, position);
      setSelectedNodeId(node.id);
    },
    [addNode, contextMenu, screenToFlowPosition],
  );

  const handleNodeClick: NodeMouseHandler<AIFlowNode> = useCallback(
    (_event, node) => {
      setSelectedNodeId(node.id);
      setContextMenu(null);
    },
    [],
  );

  const handleNodeContextMenu: NodeMouseHandler<AIFlowNode> = useCallback(
    (event, node) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    [],
  );

  const handlePaneContextMenu = useCallback((event: ReactMouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  }, []);

  if (flowId && flowQuery.isLoading) {
    return (
      <div className="flex h-full flex-col gap-3 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="min-h-0 flex-1 rounded-xl" />
      </div>
    );
  }

  if (flowId && flowQuery.isError) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
        Unable to load this flow.
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col">
      <FlowToolbar
        flowName={flowName}
        testMessage={testMessage}
        isSaving={isSaving}
        canExecute={Boolean(flowId)}
        versionNumber={latestVersionQuery.data?.version_number}
        onFlowNameChange={setFlowName}
        onTestMessageChange={setTestMessage}
        onAddNode={() =>
          setContextMenu({
            x: window.innerWidth / 2 - 120,
            y: 120,
          })
        }
        onSave={() => void handleSave()}
        onExport={handleExport}
        onExecute={() => void handleExecute()}
      />

      {contextMenu ? (
        <FlowContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          nodeId={contextMenu.nodeId}
          onAddNode={handleAddNode}
          onChangeType={changeNodeType}
          onDeleteNode={handleDeleteNode}
          onClose={() => setContextMenu(null)}
        />
      ) : null}

      <FlowCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onNodeContextMenu={handleNodeContextMenu}
        onPaneClick={() => {
          setSelectedNodeId(null);
          setContextMenu(null);
        }}
        onPaneContextMenu={handlePaneContextMenu}
      />

      {selectedNode ? (
        <NodeConfigPanel
          node={selectedNode}
          onUpdate={updateNodeData}
          onClose={() => setSelectedNodeId(null)}
          onSave={() => void handleSave()}
          onDelete={handleDeleteNode}
          isSaving={isSaving}
        />
      ) : null}
    </div>
  );
}
