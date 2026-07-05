import { Navigate, createBrowserRouter } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import DashboardHomePage from "./pages/DashboardHomePage";
import FlowsPage from "./pages/FlowsPage";
import FlowBuilderPage from "./pages/FlowBuilderPage";
import AgentsPage from "./pages/AgentsPage";
import SessionsPage from "./pages/SessionsPage";
import SessionDetailPage from "./pages/SessionDetailPage";
import ExecutionsPage from "./pages/ExecutionsPage";
import UsersPage from "./pages/UsersPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import RevenuePage from "./pages/RevenuePage";
import AuditLogPage from "./pages/AuditLogPage";
import AlertsPage from "./pages/AlertsPage";
import IntegrationsPage from "./pages/IntegrationsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardHomePage /> },
      { path: "integrations", element: <IntegrationsPage /> },

      // Build
      { path: "flows", element: <FlowsPage /> },
      { path: "flows/:id/edit", element: <FlowBuilderPage /> },
      { path: "agents", element: <AgentsPage /> },

      // Monitor
      { path: "sessions", element: <SessionsPage /> },
      { path: "sessions/:id", element: <SessionDetailPage /> },
      { path: "executions", element: <ExecutionsPage /> },

      // Team
      { path: "users", element: <UsersPage /> },

      // Analyze
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "analytics/revenue", element: <RevenuePage /> },
      { path: "analytics/audit-log", element: <AuditLogPage /> },

      // Notify
      { path: "notifications/alerts", element: <AlertsPage /> },

      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
