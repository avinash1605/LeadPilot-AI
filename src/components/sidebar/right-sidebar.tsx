"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { PulseSummary } from "@/components/sidebar/pulse-summary";
import { IntelligenceTabs } from "@/components/sidebar/intelligence-tabs";
import { useUiStore } from "@/lib/store/ui-store";
import { cn } from "@/lib/utils";

interface RightSidebarProps {
  activeModeId?: string | null;
  onCategoryClick?: (category: "alerts" | "actions" | "insights") => void;
  onActionClick?: (label: string) => void;
}

export function RightSidebar({
  activeModeId,
  onCategoryClick,
  onActionClick,
}: RightSidebarProps) {
  const { pulseSidebarOpen, togglePulseSidebar } = useUiStore();
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-l border-zinc-800 bg-zinc-950/80 transition-all duration-200",
        pulseSidebarOpen ? "w-[340px]" : "w-[56px]"
      )}
    >
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-3">
        {pulseSidebarOpen ? (
          <p className="text-xs uppercase tracking-widest text-zinc-500">Pulse</p>
        ) : (
          <span className="text-[10px] uppercase tracking-widest text-zinc-600">
            Pulse
          </span>
        )}
        <button
          type="button"
          onClick={togglePulseSidebar}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
        >
          {pulseSidebarOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {pulseSidebarOpen ? (
        <>
          <div className="flex max-h-[40%] flex-col overflow-hidden border-b border-zinc-800">
            <div className="custom-scrollbar flex-1 overflow-y-auto">
              <PulseSummary
                activeModeId={activeModeId}
                onCategoryClick={onCategoryClick}
              />
            </div>
          </div>
          <div className="flex min-h-0 flex-1">
            <IntelligenceTabs
              activeModeId={activeModeId}
              onActionClick={onActionClick}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <span className="-rotate-90 text-[10px] uppercase tracking-widest text-zinc-600">
            Pulse &amp; Calendar
          </span>
        </div>
      )}
    </aside>
  );
}
