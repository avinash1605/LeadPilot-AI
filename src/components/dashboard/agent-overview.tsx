"use client";

import {
  Brain,
  Eye,
  Mail,
  Pause,
  Play,
  Search,
  ShieldAlert,
} from "lucide-react";
import { useAgentStore } from "@/lib/store/agent-store";
import { cn } from "@/lib/utils";

const iconMap = {
  Eye,
  Brain,
  Mail,
  ShieldAlert,
  Search,
};

const typeColors: Record<string, string> = {
  monitor: "bg-blue-500/20 text-blue-400",
  classifier: "bg-indigo-500/20 text-indigo-400",
  outreach: "bg-emerald-500/20 text-emerald-400",
  risk: "bg-red-500/20 text-red-400",
  research: "bg-purple-500/20 text-purple-400",
};

export function AgentOverview() {
  const agents = useAgentStore((state) => state.agents);
  const toggleAgent = useAgentStore((state) => state.toggleAgent);
  const activeCount = agents.filter((agent) => agent.status === "active").length;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">AI Agents</h2>
        <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-500">
          {activeCount} Active
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {agents.map((agent) => {
          const Icon = iconMap[agent.icon as keyof typeof iconMap];
          const isActive = agent.status === "active";
          const statusColor = isActive
            ? "bg-green-500"
            : agent.status === "idle"
            ? "bg-yellow-400"
            : "bg-zinc-600";

          return (
            <div
              key={agent.id}
              className={cn(
                "flex items-center gap-3 rounded-lg bg-zinc-800/50 p-3 transition hover:bg-zinc-800",
                isActive && "border-l-2 border-indigo-500"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  typeColors[agent.type]
                )}
              >
                {Icon ? <Icon size={18} /> : null}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{agent.name}</p>
                <p className="truncate text-xs text-zinc-400">
                  {agent.lastAction}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      statusColor,
                      isActive && "animate-pulse"
                    )}
                  />
                  {agent.actionsToday} today
                </div>
                <button
                  type="button"
                  onClick={() => toggleAgent(agent.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
                >
                  {agent.status === "paused" ? (
                    <Play size={14} />
                  ) : (
                    <Pause size={14} />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
