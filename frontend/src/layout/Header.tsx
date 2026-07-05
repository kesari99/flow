import { Link, useLocation } from "react-router-dom";
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
import { ChevronDown } from "lucide-react";

export default function AppHeader() {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

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
        <Button variant="outline" size="sm" className="h-7 text-xs">
          Share
        </Button>
        <Button size="sm" className="h-7 text-xs">
          Deploy
        </Button>
      </div>
    </header>
  );
}
