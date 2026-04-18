"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, Eye, Mail, Search, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  iconMap,
  colorBadge,
} from "@/components/mcp/server-chip";
import {
  useIntegrationStore,
  integrationAgentMap,
} from "@/lib/store/integration-store";

const agentIconMap = {
  "Monitor Agent": Eye,
  "Classifier Agent": Brain,
  "Outreach Agent": Mail,
  "Risk Agent": ShieldAlert,
  "Research Agent": Search,
};

const agentColor: Record<string, string> = {
  "Monitor Agent": "text-blue-400 border-blue-500/30 bg-blue-500/10",
  "Classifier Agent": "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
  "Outreach Agent": "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  "Risk Agent": "text-red-400 border-red-500/30 bg-red-500/10",
  "Research Agent": "text-purple-400 border-purple-500/30 bg-purple-500/10",
};

export function ArchitectureDiagram() {
  const integrations = useIntegrationStore((state) => state.integrations);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [hoveredServer, setHoveredServer] = useState<string | null>(null);

  const agents = Object.keys(integrationAgentMap);

  const isActive = (agent: string, serverId: string) => {
    if (!hoveredAgent && !hoveredServer) return true;
    if (hoveredAgent && hoveredAgent !== agent) return false;
    if (hoveredServer && hoveredServer !== serverId) return false;
    return integrationAgentMap[agent]?.includes(serverId);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex flex-col gap-6">
        {/* Agents row */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {agents.map((agent) => {
            const Icon = agentIconMap[agent as keyof typeof agentIconMap];
            return (
              <motion.div
                key={agent}
                onMouseEnter={() => setHoveredAgent(agent)}
                onMouseLeave={() => setHoveredAgent(null)}
                whileHover={{ y: -2 }}
                className={cn(
                  "flex items-center gap-2 rounded-lg border bg-zinc-800 px-4 py-2.5 text-xs text-zinc-200 transition",
                  agentColor[agent]
                )}
              >
                {Icon ? <Icon size={14} /> : null}
                <span>{agent}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Lines to router */}
        <div className="flex justify-center">
          <div className="relative h-12 w-full max-w-2xl">
            {agents.map((_, index) => (
              <motion.span
                key={index}
                animate={{ opacity: [0.3, 0.9, 0.3] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
                style={{ left: `${(index + 0.5) * (100 / agents.length)}%` }}
                className="absolute top-0 h-full w-px bg-gradient-to-b from-indigo-500/60 to-indigo-500/0"
              />
            ))}
          </div>
        </div>

        {/* Router */}
        <div className="flex justify-center">
          <motion.div
            animate={{
              boxShadow: [
                "0 0 0 rgba(99,102,241,0)",
                "0 0 30px rgba(99,102,241,0.35)",
                "0 0 0 rgba(99,102,241,0)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-6 py-3 text-center"
          >
            <p className="text-sm font-semibold text-indigo-300">MCP Router</p>
            <p className="text-[10px] uppercase tracking-widest text-indigo-400/70">
              Tool dispatch
            </p>
          </motion.div>
        </div>

        {/* Lines to servers */}
        <div className="flex justify-center">
          <div className="relative h-12 w-full max-w-3xl">
            {integrations.map((integration, index) => (
              <motion.span
                key={integration.id}
                animate={{
                  opacity:
                    integration.status === "connected" ? [0.3, 0.9, 0.3] : 0.15,
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay: index * 0.15,
                }}
                style={{
                  left: `${(index + 0.5) * (100 / integrations.length)}%`,
                }}
                className={cn(
                  "absolute top-0 h-full w-px",
                  integration.status === "connected"
                    ? "bg-gradient-to-b from-indigo-500/60 via-emerald-500/40 to-emerald-500/60"
                    : "bg-zinc-800"
                )}
              />
            ))}
          </div>
        </div>

        {/* Servers row */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {integrations.map((integration) => {
            const Icon = iconMap[integration.icon as keyof typeof iconMap];
            const active = agents.some((agent) =>
              isActive(agent, integration.id)
            );
            const connected = integration.status === "connected";
            return (
              <Link
                key={integration.id}
                href={`/admin/mcp/servers/${integration.id}`}
                onMouseEnter={() => setHoveredServer(integration.id)}
                onMouseLeave={() => setHoveredServer(null)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border px-4 py-2.5 text-xs transition",
                  connected
                    ? colorBadge[integration.color]
                    : "border-dashed border-zinc-800 bg-zinc-900/50 text-zinc-500",
                  !active && "opacity-30"
                )}
              >
                <div className="flex items-center gap-2">
                  {Icon ? <Icon size={14} /> : null}
                  <span>{integration.name.split(" ")[0]}</span>
                </div>
                <span className="text-[10px] text-zinc-400">
                  {connected
                    ? `${integration.tools.filter((tool) => tool.enabled).length} / ${integration.tools.length} tools`
                    : "Not connected"}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
