"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  Brain,
  Eye,
  Mail,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { Agent } from "@/lib/types";
import { useAgentStore } from "@/lib/store/agent-store";

const iconMap = {
  Eye,
  Brain,
  Mail,
  ShieldAlert,
  Search,
};

const typeColors: Record<Agent["type"], string> = {
  monitor: "#3B82F6",
  classifier: "#6366F1",
  outreach: "#22C55E",
  risk: "#EF4444",
  research: "#A855F7",
};

interface AgentDetailModalProps {
  agent: Agent;
  isAdmin: boolean;
  onClose: () => void;
}

export function AgentDetailModal({ agent, isAdmin, onClose }: AgentDetailModalProps) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener("leadpilot:close-overlays", handler);
    return () => window.removeEventListener("leadpilot:close-overlays", handler);
  }, [onClose]);

  const activityLog = useAgentStore((state) => state.activityLog);
  const activities = activityLog.filter((item) => item.agentId === agent.id).slice(0, 10);
  const Icon = iconMap[agent.icon as keyof typeof iconMap];
  const color = typeColors[agent.type];

  const chartData = Array.from({ length: 12 }).map((_, index) => ({
    hour: `${index * 2}h`,
    value: Math.max(2, Math.round(4 + Math.sin(index / 2) * 6 + Math.random() * 4)),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {Icon ? <Icon size={18} /> : null}
            </div>
            <div>
              <p className="text-xl font-semibold text-white">{agent.name}</p>
              <span className="mt-1 inline-flex items-center gap-2 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {agent.status}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {isAdmin ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Agent Configuration
              </p>
              <div className="mt-4 space-y-4">
                {[
                  ["Sensitivity", 7, 10],
                  ["Priority Level", 3, 5],
                  ["Batch Size", 20, 50],
                ].map(([label, value, max]) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-sm text-zinc-300">
                      <span>{label}</span>
                      <span>{value}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={max as number}
                      defaultValue={value}
                      className="mt-2 w-full accent-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6">
            <p className="text-sm font-semibold text-white">Performance — Last 24 Hours</p>
            <div className="mt-4 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis dataKey="hour" tick={{ fill: "#71717a", fontSize: 10 }} />
                  <YAxis hide />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    fill={`${color}33`}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-white">Recent Actions</p>
            <div className="mt-3 max-h-[200px] space-y-2 overflow-y-auto pr-2">
              {activities.map((activity) => (
                <div key={activity.id} className="text-sm text-zinc-300">
                  <p className="text-xs text-zinc-500">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                  <p>{activity.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-zinc-800 p-6">
          {isAdmin ? (
            <button
              type="button"
              onClick={() => toast.success("Configuration saved")}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white"
            >
              Save Configuration
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-zinc-800 px-4 py-2 text-sm text-zinc-300"
          >
            Close
          </button>
        </div>

        <div className="sr-only" aria-live="polite" />
      </motion.div>
    </div>
  );
}
