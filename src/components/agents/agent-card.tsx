"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Eye,
  Mail,
  Pause,
  Play,
  Search,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Agent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { useIntegrationStore } from "@/lib/store/integration-store";
import { iconMap as integrationIconMap, colorBadge } from "@/components/mcp/server-chip";

const agentIntegrationMap: Record<Agent["type"], string[]> = {
  monitor: ["linkedin", "gmail"],
  classifier: ["salesforce"],
  outreach: ["gmail", "google-calendar"],
  risk: ["salesforce"],
  research: ["linkedin", "gmail"],
};

const iconMap = {
  Eye,
  Brain,
  Mail,
  ShieldAlert,
  Search,
};

const colorMap: Record<Agent["type"], string> = {
  monitor: "text-blue-400 bg-blue-500/10 border-blue-500/40",
  classifier: "text-indigo-400 bg-indigo-500/10 border-indigo-500/40",
  outreach: "text-green-400 bg-green-500/10 border-green-500/40",
  risk: "text-red-400 bg-red-500/10 border-red-500/40",
  research: "text-purple-400 bg-purple-500/10 border-purple-500/40",
};

interface AgentCardProps {
  agent: Agent;
  index: number;
  isAdmin: boolean;
  onToggle: (agentId: string) => void;
  onOpen: (agent: Agent) => void;
}

export const AgentCard = memo(function AgentCard({
  agent,
  index,
  isAdmin,
  onToggle,
  onOpen,
}: AgentCardProps) {
  const Icon = iconMap[agent.icon as keyof typeof iconMap];
  const integrations = useIntegrationStore((state) => state.integrations);
  const connectedIntegrations = (agentIntegrationMap[agent.type] ?? [])
    .map((id) => integrations.find((item) => item.id === id && item.status === "connected"))
    .filter(Boolean) as typeof integrations;
  const toolCount = connectedIntegrations.reduce(
    (sum, integration) => sum + integration.tools.length,
    0
  );
  const status =
    agent.status === "active"
      ? "text-green-400"
      : agent.status === "idle"
      ? "text-amber-400"
      : agent.status === "paused"
      ? "text-zinc-500"
      : "text-red-400";

  const borderClass =
    agent.status === "active"
      ? "agent-glow"
      : agent.status === "error"
      ? "border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
      : agent.status === "paused"
      ? "opacity-70"
      : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20",
        borderClass
      )}
    >
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl",
              colorMap[agent.type]
            )}
          >
            {Icon ? <Icon size={20} /> : null}
          </div>
          <div className={cn("flex items-center gap-1.5 text-xs", status)}>
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                agent.status === "active" && "animate-pulse bg-green-400",
                agent.status === "idle" && "bg-amber-400",
                agent.status === "paused" && "bg-zinc-500",
                agent.status === "error" && "animate-pulse bg-red-400"
              )}
            />
            {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
          </div>
        </div>

        <p className="mt-3 text-base font-semibold text-white">{agent.name}</p>
        <p className="mt-1 text-sm text-zinc-400 line-clamp-2">
          {agent.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-white">
              {agent.actionsToday}
            </p>
            <p className="text-xs text-zinc-500">Actions today</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-white">
              {formatDistanceToNow(new Date(agent.lastActionAt), {
                addSuffix: true,
              })}
            </p>
            <p className="text-xs text-zinc-500">Last action</p>
          </div>
        </div>

        <div
          className={cn(
            "mt-3 rounded-lg border-l-2 bg-zinc-800/50 p-3 text-xs text-zinc-400",
            agent.type === "monitor" && "border-blue-500",
            agent.type === "classifier" && "border-indigo-500",
            agent.type === "outreach" && "border-green-500",
            agent.type === "risk" && "border-red-500",
            agent.type === "research" && "border-purple-500"
          )}
        >
          {agent.lastAction}
        </div>

        {connectedIntegrations.length > 0 ? (
          <div className="mt-3">
            <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
              MCP Connections
            </p>
            <div
              className="mt-2 flex items-center gap-2"
              title={connectedIntegrations
                .flatMap((integration) => integration.tools.map((tool) => tool.name))
                .join(", ")}
            >
              {connectedIntegrations.map((integration) => {
                const IntegrationIcon =
                  integrationIconMap[
                    integration.icon as keyof typeof integrationIconMap
                  ];
                return (
                  <span
                    key={integration.id}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full",
                      colorBadge[integration.color]
                    )}
                  >
                    {IntegrationIcon ? <IntegrationIcon size={12} /> : null}
                  </span>
                );
              })}
              <span className="ml-auto text-[10px] text-zinc-500">
                {toolCount} tools
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-800 px-5 pb-5 pt-4">
        {isAdmin ? (
          <>
            <button
              type="button"
              onClick={() => onToggle(agent.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs",
                agent.status === "paused"
                  ? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              )}
            >
              {agent.status === "paused" ? <Play size={12} /> : <Pause size={12} />}
              {agent.status === "paused" ? "Resume" : "Pause"}
            </button>
            <button
              type="button"
              onClick={() => onOpen(agent)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
            >
              <Settings size={14} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onOpen(agent)}
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            View Details
          </button>
        )}
      </div>
    </motion.div>
  );
});
