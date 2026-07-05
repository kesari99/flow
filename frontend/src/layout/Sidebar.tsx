import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  ChevronDown,
  CreditCard,
  FileText,
  GitBranch,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  Plug,
  Plus,
  Settings,
  User,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  buildNav,
  isNavItemActive,
  manageNav,
  monitorNav,
  notificationsNav,
  reportsNav,
  type NavItem,
} from "@/config/navigation";

function SidebarNavLink({
  item,
  icon: Icon,
  match = "prefix",
  showBadge,
}: {
  item: NavItem;
  icon?: LucideIcon;
  match?: "exact" | "prefix";
  showBadge?: number;
}) {
  const location = useLocation();
  const active = isNavItemActive(location.pathname, item.path, match);

  return (
    <SidebarMenuButton
      asChild
      isActive={active}
      className="h-8 rounded-lg text-sm font-normal"
    >
      <Link to={item.path}>
        {Icon ? <Icon className="size-4" /> : null}
        <span className="truncate">{item.title}</span>
        {showBadge !== undefined ? (
          <Badge className="ml-auto h-5 border-0 bg-success px-1.5 text-[10px] text-white">
            {showBadge}
          </Badge>
        ) : null}
      </Link>
    </SidebarMenuButton>
  );
}

function NavSection({
  label,
  items,
  icons,
  match = "prefix",
  action,
}: {
  label: string;
  items: NavItem[];
  icons?: LucideIcon[];
  match?: "exact" | "prefix";
  action?: React.ReactNode;
}) {
  return (
    <div className="mt-5 first:mt-0">
      <div className="mb-1.5 flex items-center justify-between px-3">
        <span className="nav-section-label mb-0 px-0">{label}</span>
        {action}
      </div>
      <SidebarMenu className="gap-0.5 px-1">
        {items.map((item, index) => (
          <SidebarMenuItem key={item.path}>
            <SidebarNavLink item={item} icon={icons?.[index]} match={match} />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
}

export default function DashboardSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-transparent">
      <SidebarHeader className="px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="flex-1 rounded-lg hover:bg-sidebar-accent/80 data-[state=open]:bg-sidebar-accent/80"
                  >
                    <div className="flex size-8 items-center justify-center rounded-lg bg-success text-sm font-bold text-white">
                      K
                    </div>
                    <div className="flex flex-1 items-center gap-1 text-left">
                      <span className="text-foreground truncate font-semibold">
                        kesari&apos;s Workspace
                      </span>
                      <ChevronDown className="size-3.5 text-muted-foreground" />
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" side="bottom" align="start">
                  <DropdownMenuItem>Switch workspace</DropdownMenuItem>
                  <DropdownMenuItem>Create workspace</DropdownMenuItem>
                  <DropdownMenuItem>Workspace settings</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <SidebarTrigger className="size-8 hover:bg-sidebar-accent/80" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-2">
        <SidebarMenu className="gap-0.5 px-1">
          <SidebarMenuItem>
            <SidebarNavLink
              item={{ title: "Dashboard", path: "/" }}
              icon={LayoutDashboard}
              match="exact"
            />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarNavLink
              item={{ title: "Integrations", path: "/integrations" }}
              icon={Plug}
              match="prefix"
            />
          </SidebarMenuItem>
        </SidebarMenu>

        <NavSection label="Build" items={buildNav} icons={[GitBranch, Bot]} />

        <NavSection
          label="Monitor"
          items={monitorNav}
          icons={[MessageSquare, Activity]}
        />

        <NavSection
          label="Reports"
          items={reportsNav}
          icons={[BarChart3, CreditCard, FileText]}
          match="exact"
          action={
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="size-5 hover:bg-sidebar-accent/80"
              >
                <MoreHorizontal className="size-3 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-5 hover:bg-sidebar-accent/80"
                asChild
              >
                <Link to="/flows">
                  <Plus className="size-3 text-muted-foreground" />
                </Link>
              </Button>
            </div>
          }
        />

        <div className="mt-5">
          <div className="nav-section-label">Notifications</div>
          <SidebarMenu className="gap-0.5 px-1">
            {notificationsNav.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarNavLink
                  item={item}
                  icon={Bell}
                  match="exact"
                  showBadge={3}
                />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        <NavSection label="Manage" items={manageNav} icons={[Users]} />
      </SidebarContent>

      <SidebarFooter className="mt-auto gap-0.5 px-2 pb-3">
        <SidebarMenu className="gap-0.5 px-1">
          <SidebarMenuItem>
            <SidebarNavLink
              item={{ title: "Help", path: "/help" }}
              icon={HelpCircle}
              match="exact"
            />
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="hover:bg-sidebar-accent/80 data-[state=open]:bg-sidebar-accent/80"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src="" alt="kesari" />
                    <AvatarFallback className="bg-secondary text-foreground rounded-lg">
                      K
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="text-foreground truncate font-semibold">
                      kesari
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      kesari@promptflow.com
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-56"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">K</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">kesari</span>
                      <span className="text-muted-foreground truncate text-xs">
                        kesari@promptflow.com
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
