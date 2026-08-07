import { Navigate, Outlet } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUserQuery } from "@/hooks/auth";

export function RequireAuth() {
  const userQuery = useCurrentUserQuery();

  if (userQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  if (!userQuery.data) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
