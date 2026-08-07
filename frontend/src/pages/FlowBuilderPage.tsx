import { ReactFlowProvider } from "@xyflow/react";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { FlowBuilder } from "@/components/flow/FlowBuilder";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function FlowBuilderPage() {
  const { id: routeId } = useParams();

  const flowId = useMemo(() => {
    if (!routeId || routeId === "new") return undefined;
    const parsed = Number(routeId);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [routeId]);

  return (
    <TooltipProvider>
      <ReactFlowProvider>
        <FlowBuilder flowId={flowId} />
      </ReactFlowProvider>
    </TooltipProvider>
  );
}
