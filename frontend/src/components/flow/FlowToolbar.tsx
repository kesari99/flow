import type { ElementType } from "react";
import { Download, Play, Plus, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type FlowToolbarProps = {
  flowName: string;
  testMessage: string;
  isSaving: boolean;
  canExecute: boolean;
  versionNumber?: number;
  onFlowNameChange: (value: string) => void;
  onTestMessageChange: (value: string) => void;
  onAddNode: () => void;
  onSave: () => void;
  onExport: () => void;
  onExecute: () => void;
};

function ToolbarIconButton({
  icon: Icon,
  tooltip,
  onClick,
  className,
  disabled,
}: {
  icon: ElementType;
  tooltip: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("size-8", className)}
          onClick={onClick}
          disabled={disabled}
        >
          <Icon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

export function FlowToolbar({
  flowName,
  testMessage,
  isSaving,
  canExecute,
  versionNumber,
  onFlowNameChange,
  onTestMessageChange,
  onAddNode,
  onSave,
  onExport,
  onExecute,
}: FlowToolbarProps) {
  return (
    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
      <div className="flex items-center gap-1.5 rounded-xl border bg-card/95 p-1.5 shadow-xl backdrop-blur-sm">
        <ToolbarIconButton icon={Plus} tooltip="Add Node" onClick={onAddNode} />
        <div className="mx-1 h-5 w-px bg-border" />
        <ToolbarIconButton
          icon={Play}
          tooltip="Test Flow"
          onClick={onExecute}
          disabled={!canExecute}
          className="text-emerald-400 hover:text-emerald-300"
        />
        <ToolbarIconButton
          icon={Save}
          tooltip={isSaving ? "Saving…" : "Save + version"}
          onClick={onSave}
          disabled={isSaving}
        />
        <ToolbarIconButton
          icon={Download}
          tooltip="Export"
          onClick={onExport}
        />
        {typeof versionNumber === "number" ? (
          <Badge variant="outline" className="ml-1 h-6 text-[10px]">
            v{versionNumber}
          </Badge>
        ) : null}
      </div>

      <div className="flex items-center gap-2 rounded-xl border bg-card/95 px-3 py-2 shadow-xl backdrop-blur-sm">
        <Input
          value={flowName}
          onChange={(event) => onFlowNameChange(event.target.value)}
          className="h-7 min-w-[140px] border-transparent bg-transparent px-1 text-sm shadow-none"
          aria-label="Flow name"
        />
        <Input
          value={testMessage}
          onChange={(event) => onTestMessageChange(event.target.value)}
          placeholder="Test message"
          className="h-7 w-40 text-xs"
          aria-label="Test message"
        />
      </div>
    </div>
  );
}
