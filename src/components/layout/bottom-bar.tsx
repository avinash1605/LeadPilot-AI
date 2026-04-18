import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type BottomBarProps = {
  counts: { alerts: number; actions: number; insights: number };
  activeFilter?: "alerts" | "actions" | "insights" | null;
  onFilter?: (filter: "alerts" | "actions" | "insights") => void;
  onLogClick?: () => void;
};

export function BottomBar({
  counts,
  activeFilter,
  onFilter,
  onLogClick,
}: BottomBarProps) {
  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky bottom-0 z-10 flex h-10 items-center justify-between border-t border-zinc-800 bg-zinc-900/90 px-4 text-xs text-zinc-500 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2">
        <Chip
          label="Alerts"
          count={counts.alerts}
          color="red"
          active={activeFilter === "alerts"}
          onClick={() => onFilter?.("alerts")}
        />
        <Chip
          label="Actions"
          count={counts.actions}
          color="blue"
          active={activeFilter === "actions"}
          onClick={() => onFilter?.("actions")}
        />
        <Chip
          label="Insights"
          count={counts.insights}
          color="indigo"
          active={activeFilter === "insights"}
          onClick={() => onFilter?.("insights")}
        />
      </div>

      <button
        type="button"
        onClick={onLogClick}
        className="hidden items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 md:flex"
      >
        <Settings size={12} />
        Today&apos;s log (0)
      </button>

      <div className="flex items-center gap-3 text-[10px] text-zinc-600">
        <span>N = next lead</span>
        <span>Q = next question</span>
        <span>I = interrupt</span>
      </div>
    </motion.div>
  );
}

function Chip({
  label,
  count,
  color,
  active,
  onClick,
}: {
  label: string;
  count: number;
  color: "red" | "blue" | "indigo";
  active?: boolean;
  onClick?: () => void;
}) {
  const colorMap = {
    red: "text-red-400 hover:bg-red-500/10",
    blue: "text-blue-400 hover:bg-blue-500/10",
    indigo: "text-indigo-400 hover:bg-indigo-500/10",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1 transition",
        colorMap[color],
        active && "bg-zinc-800 text-white"
      )}
    >
      {label} ({count})
    </button>
  );
}
