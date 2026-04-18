import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      <Sidebar isMobile={false} />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Topbar isMobile={false} onMenuToggle={() => {}} />
        <section className="flex-1">{children}</section>
      </div>
    </div>
  );
}
