"use client";

import { useRouter } from "next/navigation";
import { Clock, KanbanSquare, Mail, Phone, Search } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FocusMode } from "@/lib/types";

const iconMap = {
  Mail,
  Phone,
  KanbanSquare,
  Search,
  Clock,
};

const colorMap: Record<string, string> = {
  indigo: "text-indigo-400 bg-indigo-500/10",
  emerald: "text-emerald-400 bg-emerald-500/10",
  amber: "text-amber-400 bg-amber-500/10",
  violet: "text-violet-400 bg-violet-500/10",
  rose: "text-rose-400 bg-rose-500/10",
};

const borderHoverMap: Record<string, string> = {
  indigo: "hover:border-indigo-500",
  emerald: "hover:border-emerald-500",
  amber: "hover:border-amber-500",
  violet: "hover:border-violet-500",
  rose: "hover:border-rose-500",
};

interface FocusModeCardProps {
  mode: FocusMode;
  index: number;
}

export function FocusModeCard({ mode, index }: FocusModeCardProps) {
  const router = useRouter();
  const Icon = iconMap[mode.icon as keyof typeof iconMap];
  const colorClasses = colorMap[mode.color] ?? colorMap.indigo;
  const borderHover = borderHoverMap[mode.color] ?? borderHoverMap.indigo;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      onClick={() => router.push(`/user/focus/${mode.id}`)}
      className={cn(
        "flex min-w-[200px] flex-1 flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20",
        borderHover
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full",
          colorClasses
        )}
      >
        {Icon ? <Icon size={18} /> : null}
      </div>
      <div>
        <p className="text-base font-medium text-white">{mode.name}</p>
        <p className="mt-1 text-sm text-zinc-400">{mode.description}</p>
      </div>
      <span className="text-sm text-indigo-400">Enter →</span>
    </motion.button>
  );
}
