"use client";

import { motion } from "framer-motion";
import {
  Boxes,
  Calendar,
  Cloud,
  Hash,
  Link2,
  Mail,
  MessageCircle,
  Webhook,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Integration } from "@/lib/store/integration-store";

export const iconMap = {
  Link2,
  Cloud,
  Mail,
  Hash,
  Boxes,
  MessageCircle,
  Calendar,
  Webhook,
};

export const colorBadge: Record<string, string> = {
  blue: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  red: "text-red-400 bg-red-500/10 border-red-500/30",
  emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  purple: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  orange: "text-orange-400 bg-orange-500/10 border-orange-500/30",
};

interface ServerChipProps {
  integration: Integration;
  onClick?: () => void;
}

export function ServerChip({ integration, onClick }: ServerChipProps) {
  const Icon = iconMap[integration.icon as keyof typeof iconMap] ?? Link2;
  const isConnected = integration.status === "connected";

  return (
    <button
      type="button"
      onClick={onClick}
      title={
        isConnected
          ? `Connected · ${integration.tools.length} tools`
          : "Not connected — Set up in Settings"
      }
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition",
        isConnected
          ? cn("bg-zinc-800 text-zinc-200", colorBadge[integration.color])
          : "border-zinc-800 bg-zinc-900 text-zinc-500 opacity-50 hover:opacity-100"
      )}
    >
      <Icon size={14} />
      <span>{integration.name}</span>
      {isConnected ? (
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="h-1.5 w-1.5 rounded-full bg-emerald-400"
        />
      ) : (
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">
          Available
        </span>
      )}
    </button>
  );
}
