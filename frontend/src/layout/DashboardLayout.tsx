import { Outlet } from "react-router-dom";
import type { CSSProperties } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "./Sidebar";
import AppHeader from "./Header";

export default function DashboardLayout() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "15rem",
        } as CSSProperties
      }
    >
      <div className="flex h-screen w-full bg-outer">
        <DashboardSidebar />

        <div className="flex min-w-0 flex-1 flex-col p-3 pl-2">
          <div className="border-border bg-elevated flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border">
            <AppHeader />
            <main className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="mx-auto max-w-6xl">
                  <Outlet />
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
