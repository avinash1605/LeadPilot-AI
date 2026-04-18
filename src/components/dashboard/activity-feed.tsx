"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Brain, Eye, Mail, Search, ShieldAlert } from "lucide-react";
import { useAgentStore } from "@/lib/store/agent-store";

const iconMap = {
  Eye,
  Brain,
  Mail,
  ShieldAlert,
  Search,
};

const typeColors: Record<string, string> = {
  monitor: "bg-blue-500",
  classifier: "bg-indigo-500",
  outreach: "bg-emerald-500",
  risk: "bg-red-500",
  research: "bg-purple-500",
};

export function ActivityFeed() {
  const activityLog = useAgentStore((state) => state.activityLog);
  const agents = useAgentStore((state) => state.agents);
  const items = activityLog.slice(0, 15);

  return (
    <div className="custom-scrollbar max-h-[400px] rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        <div className="flex items-center gap-2 text-xs text-green-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          Live
        </div>
      </div>

      <div className="mt-4 space-y-1">
        {items.map((activity, index) => {
          const agent = agents.find((item) => item.id === activity.agentId);
          const Icon = agent
            ? iconMap[agent.icon as keyof typeof iconMap]
            : undefined;
          const color = agent ? typeColors[agent.type] : "bg-zinc-500";

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className="flex items-center gap-3 border-b border-zinc-800 py-2.5 last:border-b-0"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-zinc-300">
                {Icon ? <Icon size={12} /> : null}
              </div>
              <p className="flex-1 text-sm text-zinc-300">{activity.detail}</p>
              <span className="text-xs text-zinc-500">
                {formatDistanceToNow(new Date(activity.timestamp), {
                  addSuffix: true,
                })}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
