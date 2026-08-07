import { Handle, Position } from "@xyflow/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { NodePort } from "@/schemas/flow-node.schema";

type FlowNodeHandlesProps = {
  ports: NodePort[];
  kind: "source" | "target";
};

export function FlowNodeHandles({ ports, kind }: FlowNodeHandlesProps) {
  const position = kind === "source" ? Position.Right : Position.Left;
  const tooltipSide = kind === "source" ? "right" : "left";

  return (
    <>
      {ports.map((port, index) => {
        const top =
          ports.length === 1
            ? "50%"
            : `${((index + 1) / (ports.length + 1)) * 100}%`;

        return (
          <Tooltip key={port.id}>
            <TooltipTrigger asChild>
              <Handle
                type={kind}
                position={position}
                id={port.id}
                style={{ top }}
                className={cn(
                  "!size-3 !rounded-full !border-2 !border-border !bg-muted",
                  "hover:!size-4 hover:!border-primary hover:!bg-primary/20",
                  "transition-all duration-150",
                )}
              />
            </TooltipTrigger>
            <TooltipContent side={tooltipSide} className="text-xs">
              {port.label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </>
  );
}
