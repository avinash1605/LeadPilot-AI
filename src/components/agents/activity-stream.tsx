"use client";

import { memo, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Eye, Mail, Radio, Search, ShieldAlert } from "lucide-react";
import { useAgentStore } from "@/lib/store/agent-store";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import type { Agent, AgentActivity } from "@/lib/types";

const iconMap = {
  Eye,
  Brain,
  Mail,
  ShieldAlert,
  Search,
};

const typeColor: Record<string, string> = {
  monitor: "text-blue-400 bg-blue-500/10 border-blue-500/40",
  classifier: "text-indigo-400 bg-indigo-500/10 border-indigo-500/40",
  outreach: "text-green-400 bg-green-500/10 border-green-500/40",
  risk: "text-red-400 bg-red-500/10 border-red-500/40",
  research: "text-purple-400 bg-purple-500/10 border-purple-500/40",
};

const ActivityItem = memo(function ActivityItem({
  activity,
  index,
  agent,
}: {
  activity: AgentActivity;
  index: number;
  agent?: Agent;
}) {
  const Icon = agent ? iconMap[agent.icon as keyof typeof iconMap] : null;
  const colorClass = agent ? typeColor[agent.type] : "text-zinc-400 bg-zinc-800";
  const timestamp = new Date(activity.timestamp).toLocaleTimeString("en-US", {
    hour12: false,
  });

  const actionParts = activity.detail.split(
    /(\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\b)/g
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, backgroundColor: "rgba(99,102,241,0.06)" }}
      animate={{
        opacity: 1,
        y: 0,
        backgroundColor: index === 0 ? "rgba(99,102,241,0)" : "rgba(0,0,0,0)",
      }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      className="relative flex items-start gap-3 border-b border-zinc-800/50 py-3 pl-2 last:border-b-0"
    >
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-[3px]",
          agent?.type === "monitor" && "bg-blue-500",
          agent?.type === "classifier" && "bg-indigo-500",
          agent?.type === "outreach" && "bg-green-500",
          agent?.type === "risk" && "bg-red-500",
          agent?.type === "research" && "bg-purple-500"
        )}
      />
      <span className="w-16 text-xs text-zinc-600 font-mono">{timestamp}</span>
      <span
        className={cn(
          "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]",
          colorClass
        )}
      >
        {Icon ? <Icon size={12} /> : null}
        {agent?.name ?? "Agent"}
      </span>
      <p className="flex-1 text-sm text-zinc-300">
        {actionParts.map((part, partIndex) => {
          if (/^[A-Z][a-z]+(?:\s[A-Z][a-z]+)?$/.test(part)) {
            return (
              <span
                key={`${part}-${partIndex}`}
                className="rounded bg-zinc-800 px-1 text-xs text-zinc-200"
              >
                {part}
              </span>
            );
          }
          return <span key={`${part}-${partIndex}`}>{part}</span>;
        })}
      </p>
    </motion.div>
  );
});

const filters = ["all", "monitor", "classifier", "outreach", "risk", "research"] as const;

const filterColor: Record<(typeof filters)[number], string> = {
  all: "bg-indigo-500/10 text-indigo-400",
  monitor: "bg-blue-500/10 text-blue-400",
  classifier: "bg-indigo-500/10 text-indigo-400",
  outreach: "bg-green-500/10 text-green-400",
  risk: "bg-red-500/10 text-red-400",
  research: "bg-purple-500/10 text-purple-400",
};

export function ActivityStream() {
  const activityLog = useAgentStore((state) => state.activityLog);
  const agents = useAgentStore((state) => state.agents);
  const [filter, setFilter] = useState<typeof filters[number]>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return activityLog;
    return activityLog.filter((item) => {
      const agent = agents.find((a) => a.id === item.agentId);
      return agent?.type === filter;
    });
  }, [activityLog, agents, filter]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">Live Activity Stream</h3>
          <div className="flex items-center gap-2 text-xs text-green-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            Live
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                "rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400 transition",
                filter === item && filterColor[item]
              )}
            >
              {item === "all" ? "All" : item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="custom-scrollbar max-h-[400px] overflow-y-auto px-6 py-2">
        {filtered.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Radio}
              title="No recent activity"
              description="Agents are warming up..."
            />
          </div>
        ) : (
          filtered.map((activity, index) => {
            const agent = agents.find((a) => a.id === activity.agentId);
            return (
              <ActivityItem
                key={activity.id}
                activity={activity}
                index={index}
                agent={agent}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
