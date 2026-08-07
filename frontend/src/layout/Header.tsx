import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { getBreadcrumbs } from "@/config/navigation";
import { useCurrentUserQuery, useLogoutMutation } from "@/hooks/auth";
import { ChevronDown } from "lucide-react";

export default function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const breadcrumbs = getBreadcrumbs(location.pathname);
  const userQuery = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();

  return (
    <header className="border-border flex h-12 shrink-0 items-center gap-3 border-b px-4">
      <Breadcrumb>
        <BreadcrumbList className="text-sm">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <BreadcrumbItem key={crumb.href}>
                {isLast ? (
                  <div className="flex items-center gap-1">
                    <BreadcrumbPage className="text-foreground font-medium">
                      {crumb.label}
                    </BreadcrumbPage>
                    <ChevronDown className="size-3 text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <BreadcrumbLink asChild>
                      <Link
                        to={crumb.href}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {crumb.label}
                      </Link>
                    </BreadcrumbLink>
                    <BreadcrumbSeparator className="text-muted-foreground" />
                  </>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        {userQuery.data ? (
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {userQuery.data.email}
          </span>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          disabled={logoutMutation.isPending}
          onClick={() => {
            void logoutMutation.mutateAsync().then(() => {
              navigate("/login", { replace: true });
            });
          }}
        >
          Sign out
        </Button>
      </div>
    </header>
  );
}
