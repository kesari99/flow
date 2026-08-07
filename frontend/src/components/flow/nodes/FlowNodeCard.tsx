import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  CATEGORY_COLORS,
  NODE_ICONS,
} from "@/config/flow-node-definitions";
import { cn } from "@/lib/utils";
import {
  NodeExecutionStatus,
  NodeFieldType,
  type AIFlowNodeData,
} from "@/schemas/flow-node.schema";

const STATUS_ICONS = {
  [NodeExecutionStatus.Idle]: null,
  [NodeExecutionStatus.Running]: (
    <Loader2 className="size-3 animate-spin text-blue-400" />
  ),
  [NodeExecutionStatus.Success]: (
    <CheckCircle2 className="size-3 text-green-400" />
  ),
  [NodeExecutionStatus.Error]: <XCircle className="size-3 text-red-400" />,
};

type FlowNodeCardProps = {
  data: AIFlowNodeData;
  selected: boolean;
};

export function FlowNodeCard({ data, selected }: FlowNodeCardProps) {
  const Icon = NODE_ICONS[data.type];
  const statusIcon = STATUS_ICONS[data.status];

  return (
    <div
      className={cn(
        "min-w-[220px] max-w-[280px] rounded-xl border bg-card/95 shadow-xl backdrop-blur-sm transition-all",
        data.status === NodeExecutionStatus.Running &&
          "border-blue-500/50 shadow-blue-500/20 shadow-lg",
        data.status === NodeExecutionStatus.Success && "border-green-500/50",
        data.status === NodeExecutionStatus.Error && "border-red-500/50",
        selected && "ring-2 ring-ring ring-offset-1 ring-offset-background",
      )}
    >
      <div className="flex items-center justify-between gap-2 p-3 pb-2">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-lg border",
              CATEGORY_COLORS[data.category],
            )}
          >
            <Icon className="size-3.5" />
          </div>
          <p className="truncate text-sm font-medium">{data.label}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {statusIcon}
          <Badge
            variant="outline"
            className={cn(
              "h-5 border-0 px-1.5 text-[9px] font-medium tracking-wide uppercase",
              CATEGORY_COLORS[data.category],
            )}
          >
            {data.category}
          </Badge>
        </div>
      </div>

      <div className="space-y-2 px-3 pb-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {data.description}
        </p>

        {data.fields.slice(0, 3).map((field) => (
          <div key={field.key} className="flex items-baseline gap-1.5 text-xs">
            <span className="shrink-0 text-muted-foreground">{field.label}:</span>
            <span className="min-w-0 truncate">
              {field.type === NodeFieldType.Toggle
                ? field.value
                  ? "On"
                  : "Off"
                : String(field.value)}
            </span>
          </div>
        ))}

        {data.fields.length > 3 ? (
          <p className="text-[10px] text-muted-foreground">
            +{data.fields.length - 3} more fields
          </p>
        ) : null}
      </div>
    </div>
  );
}
