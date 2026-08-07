import { useCallback } from "react";
import { RotateCcw, Save, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { NodeFieldEditor } from "@/components/flow/panels/NodeFieldEditor";
import {
  CATEGORY_COLORS,
  NODE_DEFINITIONS,
  NODE_ICONS,
} from "@/config/flow-node-definitions";
import type { AIFlowNode } from "@/lib/flow-node-mapper";
import { cn } from "@/lib/utils";
import type { AIFlowNodeData } from "@/schemas/flow-node.schema";

type NodeConfigPanelProps = {
  node: AIFlowNode;
  onUpdate: (nodeId: string, updates: Partial<AIFlowNodeData>) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: (nodeId: string) => void;
  isSaving?: boolean;
};

export function NodeConfigPanel({
  node,
  onUpdate,
  onClose,
  onSave,
  onDelete,
  isSaving = false,
}: NodeConfigPanelProps) {
  const definition = NODE_DEFINITIONS[node.data.type];
  const Icon = NODE_ICONS[node.data.type];

  const handleFieldChange = useCallback(
    (fieldKey: string, value: string | number | boolean) => {
      const fields = node.data.fields.map((field) =>
        field.key === fieldKey ? { ...field, value } : field,
      );
      onUpdate(node.id, {
        fields,
        config: { ...node.data.config, [fieldKey]: value },
      });
    },
    [node.data.config, node.data.fields, node.id, onUpdate],
  );

  const handleReset = useCallback(() => {
    onUpdate(node.id, {
      label: definition.label,
      fields: definition.defaultFields.map((field) => ({ ...field })),
      config: { ...definition.defaultConfig },
    });
  }, [definition, node.id, onUpdate]);

  return (
    <aside className="absolute top-3 right-3 bottom-3 z-20 flex w-80 flex-col overflow-hidden rounded-xl border bg-card/95 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-lg border",
              CATEGORY_COLORS[node.data.category],
            )}
          >
            <Icon className="size-3.5" />
          </div>
          <div>
            <p className="text-sm font-medium">{definition.label}</p>
            <p className="text-[10px] text-muted-foreground">{node.id}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="size-7" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4 space-y-1.5">
          <Label className="text-xs text-muted-foreground">Display Name</Label>
          <Input
            value={node.data.label}
            onChange={(event) =>
              onUpdate(node.id, { label: event.target.value })
            }
            className="h-8 text-sm"
          />
        </div>

        <div className="mb-4 flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn("border-0 text-[10px]", CATEGORY_COLORS[node.data.category])}
          >
            {node.data.category}
          </Badge>
          <Badge variant="outline" className="text-[10px] text-muted-foreground">
            {node.data.status}
          </Badge>
        </div>

        <Separator className="mb-4" />

        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">
            Configuration
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px]"
            onClick={handleReset}
          >
            <RotateCcw className="mr-1 size-3" />
            Reset
          </Button>
        </div>

        <div className="space-y-4">
          {node.data.fields.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No configuration for this node.
            </p>
          ) : (
            node.data.fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <div className="flex items-center gap-1">
                  <Label className="text-xs text-muted-foreground">
                    {field.label}
                  </Label>
                  {field.required ? (
                    <span className="text-[10px] text-destructive">*</span>
                  ) : null}
                </div>
                <NodeFieldEditor
                  field={field}
                  onChange={(value) => handleFieldChange(field.key, value)}
                />
                {field.description ? (
                  <p className="text-[10px] leading-relaxed text-muted-foreground">
                    {field.description}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">
            Connections
          </h3>
          {definition.inputs.map((input) => (
            <div
              key={input.id}
              className="flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5 text-xs"
            >
              <span className="text-muted-foreground">In</span>
              {input.label}
            </div>
          ))}
          {definition.outputs.map((output) => (
            <div
              key={output.id}
              className="flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5 text-xs"
            >
              <span className="text-muted-foreground">Out</span>
              {output.label}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 border-t p-3">
        <Button
          size="sm"
          className="h-8 w-full text-xs"
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="mr-1.5 size-3.5" />
          {isSaving ? "Saving…" : "Save Changes"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="h-8 w-full text-xs"
          onClick={() => onDelete(node.id)}
        >
          <Trash2 className="mr-1.5 size-3.5" />
          Delete node
        </Button>
      </div>
    </aside>
  );
}
