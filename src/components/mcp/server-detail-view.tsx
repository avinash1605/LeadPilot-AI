"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Copy, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIntegrationStore } from "@/lib/store/integration-store";
import { iconMap, colorBadge } from "@/components/mcp/server-chip";
import { ToolCard } from "@/components/mcp/tool-card";
import { SetupWizard } from "@/components/mcp/setup-wizard";
import { formatDistanceToNow } from "date-fns";

interface ServerDetailViewProps {
  serverId: string;
  basePath: string;
}

const tabs = ["overview", "tools", "configuration", "logs"] as const;
type TabKey = (typeof tabs)[number];

export function ServerDetailView({ serverId, basePath }: ServerDetailViewProps) {
  const integration = useIntegrationStore((state) =>
    state.integrations.find((item) => item.id === serverId)
  );
  const toolCalls = useIntegrationStore((state) => state.toolCalls);
  const disconnect = useIntegrationStore((state) => state.disconnectServer);
  const connect = useIntegrationStore((state) => state.connectServer);
  const setAllTools = useIntegrationStore((state) => state.setAllTools);
  const [tab, setTab] = useState<TabKey>("overview");
  const [search, setSearch] = useState("");

  const serverLogs = useMemo(
    () => toolCalls.filter((call) => call.integrationId === serverId).slice(0, 30),
    [toolCalls, serverId]
  );

  if (!integration) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-10 text-center">
        <p className="text-sm text-zinc-400">Server not found.</p>
        <Link
          href={basePath}
          className="mt-4 inline-block text-xs text-indigo-400"
        >
          ← All servers
        </Link>
      </div>
    );
  }

  const Icon = iconMap[integration.icon as keyof typeof iconMap];
  const isConnected = integration.status === "connected";

  const filteredTools = integration.tools.filter((tool) =>
    !search.trim()
      ? true
      : tool.name.toLowerCase().includes(search.trim().toLowerCase())
  );
  const enabledCount = integration.tools.filter((tool) => tool.enabled).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={basePath}
            className="text-xs text-zinc-400 hover:text-white"
          >
            ← All servers
          </Link>
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-xl",
              colorBadge[integration.color]
            )}
          >
            {Icon ? <Icon size={26} /> : null}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{integration.name}</h1>
            <p className="text-xs text-zinc-400 capitalize">
              {integration.provider} · {integration.category}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-wider text-emerald-300">
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                />
                Connected
              </span>
              <button
                type="button"
                onClick={() => {
                  disconnect(integration.id);
                  toast.info(`${integration.name} disconnected`);
                }}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                connect(integration.id);
                toast.success(`${integration.name} connected`);
              }}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs text-white"
            >
              Set Up Connection
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-zinc-800">
        {tabs.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setTab(name)}
            className={cn(
              "rounded-t-lg px-4 py-2 text-sm capitalize",
              tab === name
                ? "border-b-2 border-indigo-500 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            {name}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="space-y-6">
          <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
              Connection details
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm text-zinc-300">
              <Detail label="Server name" value={integration.name} />
              <Detail label="Provider" value={integration.provider} />
              <Detail label="Category" value={integration.category} capitalize />
              <Detail
                label="Endpoint"
                mono
                value={integration.mcpEndpoint ?? "—"}
              />
              <Detail label="Transport" value={integration.transport ?? "sse"} />
              <Detail label="Auth" value={integration.authMethod ?? "oauth"} capitalize />
              <Detail
                label="Connected"
                value={
                  integration.connectedAt
                    ? formatDistanceToNow(new Date(integration.connectedAt), {
                        addSuffix: true,
                      })
                    : "—"
                }
              />
              <Detail
                label="Last ping"
                value="2 seconds ago"
                emerald
              />
            </div>
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
              Server health
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-4">
              <Metric label="Uptime" value="99.9%" emerald />
              <Metric label="Avg latency" value={`${integration.avgLatency ?? 0}ms`} />
              <Metric label="Calls today" value={`${integration.callsToday ?? 0}`} />
              <Metric
                label="Error rate"
                value={`${((integration.successRate ? 100 - integration.successRate : 0)).toFixed(2)}%`}
              />
            </div>
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
              Agents using this server
            </p>
            <div className="mt-3 space-y-2 text-sm text-zinc-300">
              <p>Outreach Agent — send_email, create_draft</p>
              <p>Monitor Agent — read_inbox, search_emails</p>
              <p>Research Agent — search_emails</p>
              <p>Copilot — all tools</p>
            </div>
          </section>
        </div>
      ) : null}

      {tab === "tools" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-zinc-300">
                {integration.tools.length} tools · {enabledCount} enabled
              </p>
              <p className="text-xs text-zinc-500">
                Toggle each tool to expose it to agents and the copilot.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tools..."
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-white"
              />
              <button
                type="button"
                onClick={() => {
                  setAllTools(integration.id, true);
                  toast.success("All tools enabled");
                }}
                className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300"
              >
                Enable all
              </button>
              <button
                type="button"
                onClick={() => {
                  setAllTools(integration.id, false);
                  toast.info("All tools disabled");
                }}
                className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
              >
                Disable all
              </button>
            </div>
          </div>
          {filteredTools.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900 px-6 py-10 text-center text-sm text-zinc-400">
              No tools match this filter.
            </div>
          ) : (
            filteredTools.map((tool) => (
              <ToolCard key={tool.id} integration={integration} tool={tool} />
            ))
          )}
        </div>
      ) : null}

      {tab === "configuration" ? (
        <div className="space-y-4">
          {isConnected ? (
            <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                Connection configuration
              </p>
              <div className="grid gap-3 sm:grid-cols-2 text-sm text-zinc-300">
                <Detail label="Auth method" value={integration.authMethod ?? "oauth"} capitalize />
                <Detail
                  label="Endpoint"
                  mono
                  value={integration.mcpEndpoint ?? "—"}
                  copyable
                />
                <Detail label="Transport" value={integration.transport ?? "sse"} />
                <Detail label="Connected" value={integration.connectedAt ? formatDistanceToNow(new Date(integration.connectedAt), { addSuffix: true }) : "—"} />
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-300">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                  Rate limits
                </p>
                <p className="mt-2">100 calls / minute · retries enabled</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toast.success("Configuration saved")}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs text-white"
                >
                  Save configuration
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("Rotating credentials...")}
                  className="flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-xs text-zinc-300"
                >
                  <RefreshCcw size={12} /> Rotate key
                </button>
              </div>
            </div>
          ) : (
            <SetupWizard integration={integration} onComplete={() => setTab("tools")} />
          )}
        </div>
      ) : null}

      {tab === "logs" ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 px-5 py-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                Logs
              </p>
              <p className="text-xs text-zinc-400">
                {serverLogs.length} calls captured in the last session
              </p>
            </div>
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-[10px] text-zinc-300">
              99% success · 245ms avg
            </span>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {serverLogs.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-zinc-400">
                No logs yet. Tool calls will appear here when agents start using this server.
              </div>
            ) : (
              serverLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 border-b border-zinc-800/50 px-5 py-2 text-xs text-zinc-400"
                >
                  <span className="w-20 font-mono text-zinc-500">
                    {new Date(log.startedAt).toLocaleTimeString("en-US", {
                      hour12: false,
                    })}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                    {log.status}
                  </span>
                  <span className="font-mono text-indigo-300">{log.toolName}</span>
                  <span className="text-zinc-500">→</span>
                  <span className="truncate">{log.triggeredBy}</span>
                  <span className="ml-auto font-mono text-[10px] text-zinc-500">
                    {log.duration ?? 0}ms
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Detail({
  label,
  value,
  mono,
  capitalize,
  emerald,
  copyable,
}: {
  label: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
  emerald?: boolean;
  copyable?: boolean;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p
          className={cn(
            "text-sm",
            mono ? "font-mono text-zinc-300" : "text-zinc-200",
            capitalize && "capitalize",
            emerald && "text-emerald-300"
          )}
        >
          {value}
        </p>
        {copyable ? (
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(value);
              toast.success("Copied");
            }}
            className="text-zinc-500 hover:text-white"
          >
            <Copy size={12} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  emerald,
}: {
  label: string;
  value: string;
  emerald?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</p>
      <p
        className={cn(
          "mt-2 text-lg font-semibold",
          emerald ? "text-emerald-300" : "text-white"
        )}
      >
        {value}
      </p>
    </div>
  );
}
