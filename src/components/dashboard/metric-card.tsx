"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "flat";
  icon: LucideIcon;
  isBadTrend?: boolean;
  changeLabel?: string;
  index: number;
}

export function MetricCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
  isBadTrend = false,
  changeLabel,
  index,
}: MetricCardProps) {
  const trendIcon = trend === "down" ? ChevronDown : ChevronUp;
  const TrendIcon = trendIcon;
  const isPositive = !isBadTrend;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="mt-1 text-sm text-zinc-400">{label}</p>
        </div>
        <Icon className="h-5 w-5 text-zinc-600" />
      </div>
      <div
        className={cn(
          "mt-4 flex items-center gap-1 text-sm",
          isPositive ? "text-green-500" : "text-red-500"
        )}
      >
        <TrendIcon className="h-4 w-4" />
        <span>
          {changeLabel ?? `${change > 0 ? `+${change}` : change}%`}
        </span>
      </div>
    </motion.div>
  );
}
