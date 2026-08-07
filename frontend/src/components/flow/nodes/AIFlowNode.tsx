import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import { FlowNodeCard } from "@/components/flow/nodes/FlowNodeCard";
import { FlowNodeHandles } from "@/components/flow/nodes/FlowNodeHandles";
import { NODE_DEFINITIONS } from "@/config/flow-node-definitions";
import type { AIFlowNode } from "@/lib/flow-node-mapper";

function AIFlowNodeComponent({ data, selected }: NodeProps<AIFlowNode>) {
  const definition = NODE_DEFINITIONS[data.type];

  return (
    <div className="relative">
      <FlowNodeHandles ports={definition.inputs} kind="target" />
      <FlowNodeCard data={data} selected={selected} />
      <FlowNodeHandles ports={definition.outputs} kind="source" />
    </div>
  );
}

export default memo(AIFlowNodeComponent);
