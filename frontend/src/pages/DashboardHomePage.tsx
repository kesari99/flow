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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  GitBranch,
  Activity,
  Users,
  ArrowUpRight,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const stats = [
  {
    title: "Active Sessions",
    value: "24",
    change: "+3 today",
    icon: MessageSquare,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Total Flows",
    value: "12",
    change: "3 deployed",
    icon: GitBranch,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Executions Today",
    value: "1,240",
    change: "+12% vs yesterday",
    icon: Activity,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    title: "Team Members",
    value: "8",
    change: "2 pending invites",
    icon: Users,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

const recentActivity = [
  {
    id: 1,
    flow: "Lead enrichment",
    status: "success" as const,
    time: "2 mins ago",
    message: "Processed 45 leads",
  },
  {
    id: 2,
    flow: "Inbound lead routing",
    status: "success" as const,
    time: "15 mins ago",
    message: "Routed 12 leads to sales",
  },
  {
    id: 3,
    flow: "Weekly pipeline report",
    status: "error" as const,
    time: "1 hour ago",
    message: "Failed: API timeout",
  },
  {
    id: 4,
    flow: "Lead enrichment",
    status: "running" as const,
    time: "Just now",
    message: "Processing batch #1241",
  },
];

export default function DashboardHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Dashboard
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Overview of your chatflow workspace
          </p>
        </div>
        <Button className="h-8 text-sm" asChild>
          <Link to="/flows">
            <Zap className="mr-1.5 size-3.5" />
            New flow
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border bg-secondary/30 shadow-none">
            <CardHeader className="px-4 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  {stat.title}
                </CardTitle>
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg",
                    stat.bg,
                  )}
                >
                  <stat.icon className={cn("size-4", stat.color)} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pt-0 pb-4">
              <div className="text-2xl font-semibold text-foreground">
                {stat.value}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border bg-secondary/30 shadow-none lg:col-span-2">
          <CardHeader className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-foreground">
                  Recent Activity
                </CardTitle>
                <CardDescription className="mt-0.5 text-xs text-muted-foreground">
                  Latest flow executions and events
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link to="/executions">
                  View all
                  <ArrowUpRight className="ml-1 size-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pt-0 pb-4">
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/50">
                    {activity.status === "success" && (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    )}
                    {activity.status === "error" && (
                      <AlertCircle className="size-4 text-red-500" />
                    )}
                    {activity.status === "running" && (
                      <Clock className="size-4 animate-pulse text-amber-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">
                        {activity.flow}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "h-4 px-1 text-[10px]",
                          activity.status === "success" &&
                            "bg-emerald-50 text-emerald-700",
                          activity.status === "error" &&
                            "bg-red-50 text-red-700",
                          activity.status === "running" &&
                            "bg-amber-50 text-amber-700",
                        )}
                      >
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {activity.message}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-secondary/30 shadow-none">
          <CardHeader className="px-4 pt-4 pb-3">
            <CardTitle className="text-sm font-medium text-foreground">
              Quick Start
            </CardTitle>
            <CardDescription className="mt-0.5 text-xs text-muted-foreground">
              Common actions to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pt-0 pb-4">
            {[
              { label: "Create a new flow", icon: GitBranch, path: "/flows" },
              {
                label: "View active sessions",
                icon: MessageSquare,
                path: "/sessions",
              },
              {
                label: "Check execution logs",
                icon: Activity,
                path: "/executions",
              },
              { label: "Invite team members", icon: Users, path: "/users" },
            ].map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-9 w-full justify-start border-border bg-secondary/30 text-sm text-foreground hover:bg-secondary/50"
                asChild
              >
                <Link to={action.path}>
                  <action.icon className="mr-2 size-4 text-muted-foreground" />
                  {action.label}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-secondary/30 shadow-none">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="text-sm font-medium text-foreground">
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-0 pb-4">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                label: "API Response Time",
                value: 45,
                unit: "ms",
              },
              {
                label: "Message Queue",
                value: 12,
                unit: " pending",
              },
              {
                label: "Error Rate",
                value: 0.2,
                unit: "%",
              },
            ].map((metric) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{metric.label}</span>
                  <span className="font-medium text-foreground">
                    {metric.value}
                    {metric.unit}
                  </span>
                </div>
                <Progress
                  value={metric.value > 100 ? 100 : metric.value * 2}
                  className="h-1.5 bg-secondary/50"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
