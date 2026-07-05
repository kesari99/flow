export type NavItem = {
  title: string;
  path: string;
};

/* ─── Build ─── */
export const buildNav: NavItem[] = [
  { title: "Flows", path: "/flows" },
  { title: "Agents", path: "/agents" },
];

/* ─── Monitor ─── */
export const monitorNav: NavItem[] = [
  { title: "Sessions", path: "/sessions" },
  { title: "Executions", path: "/executions" },
];

/* ─── Analyze ─── */
export const reportsNav: NavItem[] = [
  { title: "Overview", path: "/analytics" },
  { title: "Revenue", path: "/analytics/revenue" },
  { title: "Audit Log", path: "/analytics/audit-log" },
];

/* ─── Notify ─── */
export const notificationsNav: NavItem[] = [
  { title: "Alerts", path: "/notifications/alerts" },
];

/* ─── Manage ─── */
export const manageNav: NavItem[] = [{ title: "Users", path: "/users" }];

/** Segment slug → breadcrumb label */
export const routeLabels: Record<string, string> = {
  integrations: "Integrations",
  flows: "Flows",
  agents: "Agents",
  sessions: "Sessions",
  executions: "Executions",
  users: "Users",
  analytics: "Analytics",
  revenue: "Revenue",
  "audit-log": "Audit Log",
  notifications: "Notifications",
  alerts: "Alerts",
  edit: "Flow Builder",
};

export type BreadcrumbItem = {
  label: string;
  href: string;
};

function isIdSegment(segment: string): boolean {
  return /^[0-9a-f]{8}-/i.test(segment) || /^\d+$/.test(segment);
}

export function isNavItemActive(
  pathname: string,
  path: string,
  match: "exact" | "prefix" = "prefix",
): boolean {
  if (match === "exact") {
    return pathname === path;
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ label: "Dashboard", href: "/" }];
  }

  const crumbs: BreadcrumbItem[] = [{ label: "Dashboard", href: "/" }];
  let currentPath = "";

  for (const segment of segments) {
    currentPath += `/${segment}`;

    if (isIdSegment(segment)) {
      continue;
    }

    crumbs.push({
      label:
        routeLabels[segment] ??
        segment.charAt(0).toUpperCase() + segment.slice(1),
      href: currentPath,
    });
  }

  return crumbs;
}
