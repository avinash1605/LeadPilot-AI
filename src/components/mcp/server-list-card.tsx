"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, CheckCircle, Clock, Copy, Settings } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Integration } from "@/lib/store/integration-store";
import { colorBadge, iconMap } from "@/components/mcp/server-chip";

interface ServerListCardProps {
  integration: Integration;
  basePath: string;
}

const colorAccent: Record<string, string> = {
  blue: "bg-blue-500",
  cyan: "bg-cyan-500",
  red: "bg-red-500",
  emerald: "bg-emerald-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
};

export function ServerListCard({ integration, basePath }: ServerListCardProps) {
  const Icon = iconMap[integration.icon as keyof typeof iconMap];
  const enabled = integration.tools.filter((tool) => tool.enabled).length;
  const disabled = integration.tools.length - enabled;
  const isConnected = integration.status === "connected";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-700"
    >
      <div
        className={cn(
          "h-[3px] w-full",
          colorAccent[integration.color] ?? "bg-indigo-500"
        )}
      />
      <Link
        href={`${basePath}/${integration.id}`}
        className="flex flex-col gap-3 p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full",
                colorBadge[integration.color]
              )}
            >
              {Icon ? <Icon size={20} /> : null}
            </div>
            <div>
              <p className="text-base font-semibold text-white">{integration.name}</p>
              <p className="text-xs capitalize text-zinc-500">
                {integration.provider} · {integration.category}
              </p>
            </div>
          </div>
          <StatusBadge status={integration.status} />
        </div>

        <p className="text-sm text-zinc-400">{integration.description}</p>

        {integration.mcpEndpoint ? (
          <div className="rounded-lg bg-zinc-800/50 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
              Endpoint
            </p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="truncate font-mono text-xs text-zinc-400">
                {integration.mcpEndpoint}
              </p>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  navigator.clipboard?.writeText(integration.mcpEndpoint ?? "");
                  toast.success("Endpoint copied");
                }}
                className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between text-xs">
          <div>
            <p className="text-sm text-zinc-300">{integration.tools.length} tools</p>
            <p className="text-xs text-zinc-500">
              {enabled} enabled · {disabled} disabled
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {integration.tools.slice(0, 3).map((tool) => (
              <span
                key={tool.id}
                className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400"
              >
                {tool.name}
              </span>
            ))}
            {integration.tools.length > 3 ? (
              <span className="text-[10px] text-zinc-500">
                +{integration.tools.length - 3} more
              </span>
            ) : null}
          </div>
        </div>

        {isConnected ? (
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <BarChart3 size={12} className="text-zinc-500" />
              {integration.callsToday ?? 0} calls today
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-zinc-500" />
              {integration.avgLatency ?? 0}ms avg
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle size={12} className="text-emerald-500" />
              {integration.successRate?.toFixed(1) ?? "99.0"}% success
            </span>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
          {isConnected ? (
            <>
              <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300">
                <Settings size={12} /> Configure
              </span>
              <span className="text-xs text-indigo-400">View Tools →</span>
            </>
          ) : (
            <span className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs text-white">
              Set Up Connection →
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: Integration["status"] }) {
  if (status === "connected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-emerald-300">
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="h-1.5 w-1.5 rounded-full bg-emerald-400"
        />
        Connected
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-red-300">
        Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[10px] uppercase tracking-wider text-zinc-400">
      Available
    </span>
  );
}
