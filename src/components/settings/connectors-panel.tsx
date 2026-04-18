"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntegrationStore } from "@/lib/store/integration-store";
import { iconMap } from "@/components/mcp/server-chip";

interface ConnectorsPanelProps {
  showMcpLinks?: boolean;
}

export function ConnectorsPanel({ showMcpLinks = false }: ConnectorsPanelProps) {
  const { integrations, toggleIntegration } = useIntegrationStore();

  const grouped = integrations.reduce<Record<string, typeof integrations>>(
    (acc, integration) => {
      acc[integration.category] = acc[integration.category] ?? [];
      acc[integration.category].push(integration);
      return acc;
    },
    {}
  );

  const connectedCount = integrations.filter(
    (item) => item.status === "connected"
  ).length;

  return (
    <div className="space-y-8">
      {showMcpLinks ? (
        <div className="flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3 text-sm text-indigo-100">
          <span>
            {connectedCount} integrations connected — watch them in action live.
          </span>
          <Link href="/admin/mcp" className="text-xs text-indigo-300 hover:text-indigo-200">
            View live activity in MCP Hub →
          </Link>
        </div>
      ) : null}
      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            {category}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((connector) => {
              const Icon = iconMap[connector.icon as keyof typeof iconMap];
              const isConnected = connector.status === "connected";
              return (
                <motion.div
                  key={connector.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-indigo-400">
                        {Icon ? <Icon size={18} /> : null}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {connector.name}
                        </p>
                        <p className="text-xs text-zinc-500 capitalize">
                          {connector.category}
                        </p>
                      </div>
                    </div>
                    {isConnected ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-300">
                        <CheckCircle2 size={10} /> Connected
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
                        Available
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400">{connector.description}</p>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        const next = !isConnected;
                        toggleIntegration(connector.id);
                        toast[next ? "success" : "info"](
                          `${connector.name} ${next ? "connected" : "disconnected"}`
                        );
                      }}
                      className={cn(
                        "rounded-full px-4 py-1.5 text-xs font-medium",
                        isConnected
                          ? "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                          : "bg-indigo-600 text-white hover:bg-indigo-500"
                      )}
                    >
                      {isConnected ? "Disconnect" : "Connect"}
                    </button>
                    {showMcpLinks && isConnected ? (
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/mcp/servers/${connector.id}`}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300"
                        >
                          Manage MCP Tools →
                        </Link>
                        <Link
                          href="/admin/mcp"
                          className="text-[10px] text-indigo-400 hover:text-indigo-300"
                        >
                          View live →
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
