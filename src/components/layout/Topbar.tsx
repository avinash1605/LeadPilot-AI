"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Menu, ChevronDown, Check, LogOut, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { useUiStore } from "@/lib/store/ui-store";
import { focusModes } from "@/lib/mock-data/focus-modes";
import { cn } from "@/lib/utils";

interface TopbarProps {
  isMobile: boolean;
  onMenuToggle: () => void;
}

export function Topbar({ isMobile, onMenuToggle }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useAuthStore();
  const { activeFocusMode, setFocusMode, toggleSearchOpen } = useUiStore();
  const notifications = 3;
  const [menuOpen, setMenuOpen] = useState(false);
  const [focusOpen, setFocusOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const focusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (focusRef.current && !focusRef.current.contains(event.target as Node)) {
        setFocusOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const title = useMemo(() => {
    const focusMatch = pathname.match(/\/user\/focus\/(.+)$/);
    if (focusMatch) {
      const focus = focusModes.find((mode) => mode.id === focusMatch[1]);
      return focus?.name ?? "Focus Mode";
    }
    const map: Record<string, string> = {
      "/admin": "Dashboard",
      "/admin/leads": "Leads",
      "/admin/agents": "AI Agents",
      "/admin/pipeline": "Pipeline",
      "/admin/team": "Team",
      "/admin/settings": "Settings",
      "/user": "Home",
      "/user/leads": "My Leads",
      "/user/agents": "Agents",
      "/user/pipeline": "Pipeline",
      "/user/focus": "Focus Modes",
    };
    return map[pathname] ?? "Dashboard";
  }, [pathname]);

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

  const activeMode = focusModes.find((mode) => mode.id === activeFocusMode) ?? null;
  const focusLabel = activeMode ? activeMode.name : "Select focus mode";
  const colorDot = {
    indigo: "bg-indigo-400",
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
    violet: "bg-violet-400",
    rose: "bg-rose-400",
  }[activeMode?.color ?? "indigo"];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-zinc-300"
          >
            <Menu size={18} />
          </button>
        )}
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>

      <div className="relative hidden w-full max-w-md items-center justify-center md:flex" ref={focusRef}>
        <button
          type="button"
          onClick={() => setFocusOpen((open) => !open)}
          className={cn(
            "flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm",
            activeMode ? "text-zinc-200" : "text-zinc-400",
            "hover:border-zinc-600 hover:bg-zinc-800"
          )}
        >
          {activeMode ? <span className={cn("h-2.5 w-2.5 rounded-full", colorDot)} /> : null}
          <span>Focus: {focusLabel}</span>
          <ChevronDown size={14} className="text-zinc-400" />
        </button>
        {focusOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute top-12 z-50 w-[260px] rounded-xl border border-zinc-700 bg-zinc-900 p-2 shadow-2xl shadow-black/40"
          >
            <button
              type="button"
              onClick={() => {
                setFocusMode(null, "manual");
                router.push("/user");
                setFocusOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              <span>No focus mode</span>
              {!activeMode ? <Check size={14} className="text-indigo-400" /> : null}
            </button>
            <div className="my-1 h-px bg-zinc-800" />
            {focusModes.map((mode) => {
              const isActive = mode.id === activeFocusMode;
              const dot = {
                indigo: "bg-indigo-400",
                emerald: "bg-emerald-400",
                amber: "bg-amber-400",
                violet: "bg-violet-400",
                rose: "bg-rose-400",
              }[mode.color];
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    setFocusMode(mode.id, "manual");
                    router.push(`/user/focus/${mode.id}`);
                    setFocusOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-zinc-200 hover:bg-zinc-800",
                    isActive && "bg-indigo-500/10"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={cn("h-2.5 w-2.5 rounded-full", dot)} />
                    {mode.name}
                  </span>
                  {isActive ? <Check size={14} className="text-indigo-400" /> : null}
                </button>
              );
            })}
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSearchOpen}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-zinc-300"
          title="Search (⌘K)"
        >
          <Search size={18} />
        </button>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-zinc-300"
          title="Notifications"
        >
          <Bell size={18} className={cn(notifications > 0 && "bell-shake")} />
          {notifications > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {notifications}
            </span>
          ) : null}
        </button>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-full bg-zinc-800 px-2 py-1"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-semibold text-white">
              {initials}
            </span>
            <ChevronDown size={14} className="text-zinc-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-sm text-zinc-200 shadow-xl">
              <div className="px-3 py-2">
                <p className="text-sm text-white">{currentUser?.name}</p>
                <p className="text-xs text-zinc-500">{currentUser?.email}</p>
              </div>
              <div className="my-2 h-px bg-zinc-800" />
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-zinc-400 hover:bg-zinc-800/70 hover:text-white"
              >
                Profile
              </button>
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-zinc-400 hover:bg-zinc-800/70 hover:text-white"
              >
                Settings
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-zinc-400 hover:bg-zinc-800/70 hover:text-red-400"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
