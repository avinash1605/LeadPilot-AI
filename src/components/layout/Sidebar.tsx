"use client";

import {
  Bot,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Home,
  LayoutDashboard,
  LogOut,
  Plug,
  Settings,
  Sparkles,
  Target,
  UserCircle,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { useUiStore } from "@/lib/store/ui-store";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Pipeline", href: "/admin/pipeline", icon: GitBranch },
  { label: "Leads", href: "/admin/leads", icon: Users },
  { label: "Agents", href: "/admin/agents", icon: Bot },
  { label: "MCP Hub", href: "/admin/mcp", icon: Plug },
  { label: "Team", href: "/admin/team", icon: UserCircle },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const userNavItems = [
  { label: "Home", href: "/user", icon: Home },
  { label: "My Leads", href: "/user/leads", icon: Users },
  { label: "Focus Modes", href: "/user/focus", icon: Target },
  { label: "Pipeline", href: "/user/pipeline", icon: GitBranch },
  { label: "Agents", href: "/user/agents", icon: Bot },
  { label: "MCP Hub", href: "/user/mcp", icon: Plug },
  { label: "Settings", href: "/user/settings", icon: Settings },
];

interface SidebarProps {
  isMobile: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUiStore();
  const isCollapsed = !sidebarOpen && !isMobile;
  const navItems = currentUser?.role === "admin" ? adminNavItems : userNavItems;

  const initials =
    currentUser?.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2) ?? "LP";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isActiveRoute = (href: string) => {
    if (href === "/admin" || href === "/user") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-zinc-800 bg-zinc-900 transition-[width,transform] duration-200 ease-out",
        isCollapsed ? "w-[72px]" : "w-[260px]",
        isMobile &&
          cn(
            "fixed left-0 top-0 z-40 w-[260px] shadow-2xl",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )
      )}
    >
      <div className="flex flex-col gap-4 px-5 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isCollapsed ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-sm font-semibold text-indigo-400">
                LP
              </div>
            ) : (
              <>
                <span className="text-base font-semibold text-white">LeadPilot</span>
                <span className="rounded-full bg-indigo-500/10 px-2 py-1 text-xs font-semibold text-indigo-400">
                  AI
                </span>
              </>
            )}
          </div>
        </div>
        <div className="h-px w-full bg-zinc-800" />
      </div>

      <nav className="flex-1 space-y-1 px-3 text-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.href);
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => {
                router.push(item.href);
                onClose?.();
              }}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl text-left text-zinc-400 transition hover:bg-zinc-800/50 hover:text-white",
                isCollapsed
                  ? "mx-auto h-10 w-10 justify-center"
                  : "w-full px-3 py-2",
                isActive && "bg-indigo-500/10 text-indigo-400",
                isActive && !isCollapsed &&
                  "before:absolute before:left-0 before:top-2 before:h-6 before:w-[3px] before:rounded-full before:bg-indigo-500"
              )}
            >
              <Icon size={20} />
              <span
                className={cn(
                  "overflow-hidden transition-all duration-150",
                  isCollapsed ? "w-0 opacity-0" : "opacity-100"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div
        className={cn(
          "mt-auto pb-5",
          isCollapsed ? "flex flex-col items-center gap-3" : "px-4"
        )}
      >
        {!isCollapsed ? (
          <div className="mb-4 border-t border-zinc-800 pt-3">
            <div className="flex items-center gap-2 text-[10px] text-zinc-600">
              <Sparkles size={12} className="text-zinc-700" />
              Powered by AI
            </div>
          </div>
        ) : null}
        {!isCollapsed ? (
          <div className="flex items-center justify-between rounded-xl bg-zinc-800/40 px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-semibold text-white">
                {initials}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-white">{currentUser?.name}</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px]",
                    currentUser?.role === "admin"
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "bg-emerald-500/20 text-emerald-300"
                  )}
                >
                  {currentUser?.role === "admin" ? "Admin" : "Rep"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-zinc-500 transition hover:text-red-400"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-semibold text-white">
            {initials}
          </div>
        )}
        {isCollapsed && (
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:text-red-400"
          >
            <LogOut size={18} />
          </button>
        )}
        {!isMobile && (
          <button
            type="button"
            onClick={toggleSidebar}
            title="⌘B"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 transition hover:text-white",
              !isCollapsed && "mt-4"
            )}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>
    </aside>
  );
}
