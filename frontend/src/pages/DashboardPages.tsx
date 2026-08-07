import { useParams } from "react-router-dom";

type PageProps = {
  title: string;
  description?: string;
};

function PageShell({ title, description }: PageProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function DashboardHomePage() {
  return (
    <PageShell
      title="Dashboard"
      description="KPIs: total flows, active sessions, messages today, execution health."
    />
  );
}

export function FlowsPage() {
  return (
    <PageShell
      title="Flows"
      description="List, search, deploy, and manage chat flows (chat_flows)."
    />
  );
}

export function FlowBuilderPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <PageShell
      title="Flow Builder"
      description={`Canvas editor for flow #${id}. Loads flow_data with version history (flow_versions).`}
    />
  );
}

export function AgentsPage() {
  return (
    <PageShell
      title="Agents"
      description="Agent-type chat flows filtered from chat_flows."
    />
  );
}

export function SessionsPage() {
  return (
    <PageShell
      title="Sessions"
      description="Active and completed runtime sessions (runtime_sessions)."
    />
  );
}

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <PageShell
      title="Session Detail"
      description={`Transcript (chat_messages) and node execution timeline (node_executions) for session ${id}.`}
    />
  );
}

export function ExecutionsPage() {
  return (
    <PageShell
      title="Executions"
      description="Global node execution log — filter by status, node type, or session (node_executions)."
    />
  );
}

export function UsersPage() {
  return (
    <PageShell
      title="Users"
      description="Team management, roles, and activity (users)."
    />
  );
}

export function AnalyticsPage() {
  return (
    <PageShell
      title="Analytics"
      description="Usage charts, message volume, and execution stats."
    />
  );
}

export function RevenuePage() {
  return <PageShell title="Revenue" description="Revenue analytics." />;
}

export function AuditLogPage() {
  return <PageShell title="Audit Log" description="System audit history." />;
}

export function AlertsPage() {
  return <PageShell title="Alerts" description="Notifications and alerts." />;
}

export function SettingsPage() {
  return (
    <PageShell
      title="Settings"
      description="Workspace, API keys, and integrations."
    />
  );
}
