import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Copy,
  GitBranch,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useChatFlowsQuery,
  useDeleteChatFlowMutation,
  useDuplicateChatFlowMutation,
} from "@/hooks/chat-flow";
import { cn } from "@/lib/utils";
import type { ChatFlowDto } from "@/schemas/chat-flow.schema";

function FlowListItem({
  flow,
  onDuplicate,
  onDelete,
  isDuplicating,
  isDeleting,
}: {
  flow: ChatFlowDto;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => void;
  isDuplicating: boolean;
  isDeleting: boolean;
}) {
  const nodeCount = Array.isArray(flow.flow_data?.nodes)
    ? flow.flow_data.nodes.length
    : 0;

  return (
    <Card className="border-border bg-secondary/30 shadow-none transition-colors hover:border-muted-foreground">
      <CardHeader className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-secondary/50">
              <GitBranch className="size-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-foreground">
                <Link
                  to={`/flows/${flow.id}/edit`}
                  className="hover:underline"
                >
                  {flow.name}
                </Link>
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs text-muted-foreground">
                {flow.description || "No description"}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={cn(
                "h-5 px-1.5 text-[10px] font-medium",
                flow.deployed
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
              )}
            >
              {flow.deployed ? "deployed" : "draft"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 hover:bg-secondary/50"
                >
                  <MoreHorizontal className="size-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/flows/${flow.id}/edit`}>Open editor</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isDuplicating}
                  onClick={() => onDuplicate(flow.id)}
                >
                  <Copy className="mr-2 size-3.5" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  disabled={isDeleting || flow.deployed}
                  onClick={() => onDelete(flow.id)}
                >
                  <Trash2 className="mr-2 size-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-0 pb-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{nodeCount} nodes</span>
          <span>ID {flow.id}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FlowsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const flowsQuery = useChatFlowsQuery({
    page: 1,
    limit: 50,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });
  const deleteMutation = useDeleteChatFlowMutation();
  const duplicateMutation = useDuplicateChatFlowMutation();

  const flows = useMemo(() => {
    const items = flowsQuery.data?.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (flow) =>
        flow.name.toLowerCase().includes(q) ||
        (flow.description ?? "").toLowerCase().includes(q),
    );
  }, [flowsQuery.data?.data, search]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Flows</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Build and manage your chat flows
          </p>
        </div>
        <Button
          className="h-8 cursor-pointer text-sm"
          onClick={() => navigate("/flows/new/edit")}
        >
          <Plus className="mr-1.5 size-3.5" />
          New flow
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search flows..."
          className="h-9 border-border bg-secondary/30 pl-9 text-sm"
        />
      </div>

      {flowsQuery.isLoading ? (
        <div className="grid gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : null}

      {flowsQuery.isError ? (
        <p className="text-sm text-muted-foreground">
          Could not load flows. Make sure you are signed in and the backend is
          running.
        </p>
      ) : null}

      {!flowsQuery.isLoading && !flowsQuery.isError && flows.length === 0 ? (
        <Card className="border-dashed bg-secondary/20 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">No flows yet</CardTitle>
            <CardDescription>
              Create a basic chat flow (input → OpenAI → output) and save it to
              start versioning.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/flows/new/edit")}>
              <Plus className="mr-1.5 size-3.5" />
              Create your first flow
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3">
        {flows.map((flow) => (
          <FlowListItem
            key={flow.id}
            flow={flow}
            onDuplicate={(id) => duplicateMutation.mutate(id)}
            onDelete={(id) => {
              if (window.confirm(`Delete “${flow.name}”?`)) {
                deleteMutation.mutate(id);
              }
            }}
            isDuplicating={duplicateMutation.isPending}
            isDeleting={deleteMutation.isPending}
          />
        ))}
      </div>
    </div>
  );
}
