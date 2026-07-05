import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  MoreHorizontal,
  GitBranch,
  Play,
  Copy,
  Trash2,
} from "lucide-react";

const flows = [
  {
    id: "1",
    name: "Lead enrichment",
    description: "Enrich new signups with firmographics and post to Slack",
    status: "active" as const,
    lastRun: "2 mins ago",
    runs: 1240,
  },
  {
    id: "2",
    name: "Inbound lead routing",
    description: "Route inbound leads to the right sales rep",
    status: "active" as const,
    lastRun: "1 hour ago",
    runs: 856,
  },
  {
    id: "3",
    name: "Weekly pipeline report",
    description: "Generate and email weekly pipeline summary",
    status: "draft" as const,
    lastRun: "3 days ago",
    runs: 12,
  },
];

export default function FlowsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Flows</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Build and manage your chat flows
          </p>
        </div>
        <Button className="h-8 text-sm">
          <Plus className="mr-1.5 size-3.5" />
          New flow
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search flows..."
          className="h-9 border-border bg-secondary/30 pl-9 text-sm"
        />
      </div>

      <div className="grid gap-3">
        {flows.map((flow) => (
          <Card
            key={flow.id}
            className="border-border bg-secondary/30 shadow-none transition-colors hover:border-muted-foreground"
          >
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
                      {flow.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "h-5 px-1.5 text-[10px] font-medium",
                      flow.status === "active"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700",
                    )}
                  >
                    {flow.status}
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
                      <DropdownMenuItem>
                        <Play className="mr-2 size-3.5" />
                        Run now
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 size-3.5" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
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
                <span>{flow.runs.toLocaleString()} runs</span>
                <span>Last run {flow.lastRun}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
