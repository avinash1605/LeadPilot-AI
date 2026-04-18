"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useIntegrationStore } from "@/lib/store/integration-store";
import { ServerChip } from "@/components/mcp/server-chip";
import { ArchitectureDiagram } from "@/components/mcp/architecture-diagram";
import { ToolCallStream } from "@/components/mcp/tool-call-stream";
import { HubTabs } from "@/components/mcp/hub-tabs";

export default function MCPHubPage() {
  const integrations = useIntegrationStore((state) => state.integrations);
  const router = useRouter();

  const connected = integrations.filter(
    (integration) => integration.status === "connected"
  );
  const available = integrations.filter(
    (integration) => integration.status === "available"
  );
  const totalTools = connected.reduce(
    (sum, integration) => sum + integration.tools.length,
    0
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">MCP Hub</h1>
          <p className="text-sm text-zinc-400">
            Live infrastructure monitoring — watch your AI agents use connected tools.
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {connected.length} active MCP servers · {totalTools} tools · 847 calls today
          </p>
        </div>
        <Link
          href="/admin/settings"
          className="text-xs text-indigo-400 hover:text-indigo-300"
        >
          Manage connections →
        </Link>
      </motion.div>

      <HubTabs basePath="/admin/mcp" />

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
          Server status
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {connected.map((integration) => (
            <ServerChip key={integration.id} integration={integration} />
          ))}
          {available.length > 0 ? (
            <span className="mx-3 text-xs text-zinc-700">|</span>
          ) : null}
          {available.map((integration) => (
            <ServerChip
              key={integration.id}
              integration={integration}
              onClick={() => router.push("/admin/settings")}
            />
          ))}
        </div>
      </div>

      <ArchitectureDiagram />

      <ToolCallStream />
    </div>
  );
}
