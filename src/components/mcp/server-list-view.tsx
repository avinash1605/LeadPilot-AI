"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useIntegrationStore } from "@/lib/store/integration-store";
import { ServerListCard } from "@/components/mcp/server-list-card";
import { AddServerModal } from "@/components/mcp/add-server-modal";
import { cn } from "@/lib/utils";

const statusFilters = ["all", "connected", "available", "error"] as const;
type StatusFilter = (typeof statusFilters)[number];

interface ServerListViewProps {
  basePath: string;
}

export function ServerListView({ basePath }: ServerListViewProps) {
  const integrations = useIntegrationStore((state) => state.integrations);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const counts = useMemo(() => {
    const total = integrations.length;
    const connected = integrations.filter((item) => item.status === "connected");
    const enabledTools = connected.reduce(
      (sum, item) => sum + item.tools.filter((tool) => tool.enabled).length,
      0
    );
    const disabledTools = connected.reduce(
      (sum, item) => sum + item.tools.filter((tool) => !tool.enabled).length,
      0
    );
    return { total, connected: connected.length, enabledTools, disabledTools };
  }, [integrations]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return integrations.filter((integration) => {
      if (status !== "all" && integration.status !== status) return false;
      if (!term) return true;
      const haystack = `${integration.name} ${integration.provider} ${integration.tools
        .map((tool) => tool.name)
        .join(" ")}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [integrations, status, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">
            Servers
          </p>
          <h2 className="text-lg font-semibold text-white">
            {counts.total} servers · {counts.connected} connected
          </h2>
          <p className="text-xs text-zinc-500">
            {counts.enabledTools} tools active · {counts.disabledTools} tools disabled
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={basePath.replace("/servers", "")}
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            ← Back to Hub
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
          >
            <Plus size={14} />
            Add custom server
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search servers or tools..."
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder:text-zinc-500"
        />
        <div className="flex items-center gap-1">
          {statusFilters.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setStatus(option)}
              className={cn(
                "rounded-full px-3 py-1 text-xs capitalize",
                status === option
                  ? "bg-indigo-500/10 text-indigo-300"
                  : "text-zinc-400 hover:bg-zinc-800"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((integration) => (
          <ServerListCard
            key={integration.id}
            integration={integration}
            basePath={basePath}
          />
        ))}
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-12 text-center text-sm text-zinc-400">
            No servers match your filter.
          </div>
        ) : null}
      </div>

      <AddServerModal open={open} onClose={() => setOpen(false)} basePath={basePath} />
    </div>
  );
}
