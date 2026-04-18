"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { RightSidebar } from "@/components/sidebar/right-sidebar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { useMounted } from "@/hooks/useMounted";
import { useAuthStore } from "@/lib/store/auth-store";
import { useUiStore } from "@/lib/store/ui-store";
import { cn } from "@/lib/utils";
import { useCopilotContext } from "@/hooks/useCopilotContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  useCopilotContext();
  useKeyboardShortcuts();
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useMounted();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const {
    sidebarOpen,
    setSidebarOpen,
    activeFocusMode,
    focusModeSource,
    setFocusMode,
    activeFeedFilter,
    setFeedFilter,
    pulseSidebarOpen,
  } = useUiStore();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);
      if (mobile) {
        setSidebarOpen(false);
      } else if (tablet) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, [setSidebarOpen]);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, mounted, router]);

  useEffect(() => {
    if (!pathname.startsWith("/user")) return;
    const match = pathname.match(/\/user\/focus\/(.+)$/);
    if (match) {
      setFocusMode(match[1], "route");
      return;
    }
    if (pathname === "/user" && focusModeSource === "route") {
      setFocusMode(null, "route");
    }
  }, [focusModeSource, pathname, setFocusMode]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (detail) toast.info(detail);
    };
    window.addEventListener("leadpilot:toast", handler as EventListener);
    return () => window.removeEventListener("leadpilot:toast", handler as EventListener);
  }, []);

  const handleCategoryClick = (command: "alerts" | "actions" | "insights") => {
    setFeedFilter(activeFeedFilter === command ? null : command);
    window.dispatchEvent(
      new CustomEvent("leadpilot:toast", {
        detail: `${command[0].toUpperCase()}${command.slice(1)} view coming soon`,
      })
    );
  };

  if (!mounted || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#09090B] text-white">
      <SearchOverlay />
      {isMobile && sidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/60"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <Sidebar
        isMobile={isMobile}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <Topbar
          isMobile={isMobile}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="flex flex-1 overflow-hidden">
          <main
            className={cn(
              "flex flex-1 flex-col overflow-hidden p-6 transition-all duration-200",
              pathname !== "/user" && "overflow-y-auto"
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex min-h-0 flex-1 flex-col"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
          {!isMobile && !isTablet ? (
            <RightSidebar
              activeModeId={activeFocusMode}
              onCategoryClick={handleCategoryClick}
              onActionClick={(label) => {
                window.dispatchEvent(
                  new CustomEvent("leadpilot:toast", { detail: `${label} coming soon` })
                );
              }}
            />
          ) : null}
        </div>
      </div>

      {(isTablet || isMobile) && pulseSidebarOpen ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60"
            onClick={() =>
              useUiStore.getState().setPulseSidebarOpen(false)
            }
          />
          <div
            className={cn(
              "fixed right-0 top-0 z-50 h-full w-full max-w-[340px] bg-zinc-950/90",
              isMobile && "max-w-full"
            )}
          >
            <RightSidebar
              activeModeId={activeFocusMode}
              onCategoryClick={handleCategoryClick}
              onActionClick={(label) => {
                window.dispatchEvent(
                  new CustomEvent("leadpilot:toast", { detail: `${label} coming soon` })
                );
              }}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
