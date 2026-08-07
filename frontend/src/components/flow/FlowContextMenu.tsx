import { Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  NODE_CATEGORIES,
  NODE_DEFINITIONS,
  NODE_ICONS,
} from "@/config/flow-node-definitions";
import type { AIFlowNodeType } from "@/schemas/flow-node.schema";

type FlowContextMenuProps = {
  position: { x: number; y: number };
  nodeId?: string;
  onAddNode: (type: AIFlowNodeType) => void;
  onChangeType: (nodeId: string, type: AIFlowNodeType) => void;
  onDeleteNode?: (nodeId: string) => void;
  onClose: () => void;
};

export function FlowContextMenu({
  position,
  nodeId,
  onAddNode,
  onChangeType,
  onDeleteNode,
  onClose,
}: FlowContextMenuProps) {
  const isChanging = Boolean(nodeId);

  return (
    <div
      className="absolute z-50"
      style={{ top: position.y, left: position.x }}
      onClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div className="w-64 overflow-hidden rounded-xl border bg-card shadow-2xl">
        <div className="border-b px-3 py-2.5">
          <p className="text-xs font-medium text-muted-foreground">
            {isChanging ? "Change Node Type" : "Add Node"}
          </p>
        </div>

        {isChanging && nodeId && onDeleteNode ? (
          <div className="border-b p-1.5">
            <button
              type="button"
              onClick={() => {
                onDeleteNode(nodeId);
                onClose();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-destructive transition-colors hover:bg-destructive/10"
            >
              <div className="flex size-7 items-center justify-center rounded-md bg-destructive/10">
                <Trash2 className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">Delete node</p>
                <p className="truncate text-[10px] text-muted-foreground">
                  Remove from canvas
                </p>
              </div>
            </button>
          </div>
        ) : null}

        <ScrollArea className="h-[360px]">
          <div className="p-1.5">
            {NODE_CATEGORIES.map((category, index) => (
              <div key={category.label}>
                {index > 0 ? <Separator className="my-1.5" /> : null}
                <p className="mb-1 px-2 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                  {category.label}
                </p>
                {category.types.map((type) => {
                  const def = NODE_DEFINITIONS[type];
                  const Icon = NODE_ICONS[type];

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        if (isChanging && nodeId) {
                          onChangeType(nodeId, type);
                        } else {
                          onAddNode(type);
                        }
                        onClose();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted"
                    >
                      <div className="flex size-7 items-center justify-center rounded-md bg-muted">
                        <Icon className="size-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">
                          {def.label}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {def.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
