import { Boxes } from "lucide-react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";

export type NodeField = {
  label: string;
  value: string;
};

export type CustomNodeData = {
  label: string;
  type: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  description?: string;
  status?: "idle" | "running" | "error" | "success" | "warning";
  fields?: NodeField[];
};

const NODE_COLORS: Record<string, string> = {
  start: "#a855f7",
  process: "#22c55e",
  end: "#ef4444",
  api: "#3b82f6",
  database: "#ec4899",
  email: "#ef4444",
  deploy: "#94a3b8",
  logic: "#06b6d4",
};

const handleBase: React.CSSProperties = {
  width: 8,
  height: 8,
  background: "#a1a1aa",
  border: "2px solid #1e1e1e",
};

function CustomNode({
  data,
  id,
  selected,
}: NodeProps & { data: CustomNodeData }) {
  const {
    label,
    type,
    icon: Icon,
    description,
    status = "idle",
    fields,
  } = data;
  const color = NODE_COLORS[type] ?? NODE_COLORS.process;

  const rows: NodeField[] =
    fields && fields.length > 0
      ? fields
      : description
        ? [{ label: "Info", value: description }]
        : [];

  return (
    <div
      className={cn(
        "w-[230px] rounded-lg border bg-[#1e1e1e] transition-colors",
        selected
          ? "border-[#38bdf8] shadow-[0_0_0_1px_rgba(56,189,248,0.35)]"
          : "border-[#333333] hover:border-[#444444]",
      )}
    >
      {/* Single centered handles — Sim style */}
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-input-0`}
        style={handleBase}
      />
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-output-0`}
        style={{
          ...handleBase,
          ...(status === "error"
            ? { background: "#ef4444", borderColor: "#1e1e1e" }
            : null),
        }}
      />

      {/* Header: icon + title */}
      <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
        <div
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px]"
          style={{ backgroundColor: color }}
        >
          {Icon ? (
            <Icon className="h-3 w-3 text-white" />
          ) : (
            <Boxes className="h-3 w-3 text-white" />
          )}
        </div>
        <span className="truncate text-[13px] font-semibold tracking-tight text-white">
          {label}
        </span>
      </div>

      {/* Body: key / value rows */}
      {rows.length > 0 ? (
        <div className="space-y-1.5 px-3 pb-3">
          {rows.map((field) => (
            <div
              key={`${field.label}-${field.value}`}
              className="flex items-start justify-between gap-3 text-[11px] leading-snug"
            >
              <span className="shrink-0 text-[#94a3b8]">{field.label}</span>
              <span className="min-w-0 truncate text-right text-[#e5e5e5]">
                {field.value}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="pb-3" />
      )}
    </div>
  );
}

export default CustomNode;
