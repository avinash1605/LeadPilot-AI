"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import {
  useIntegrationStore,
  type ToolCall,
} from "@/lib/store/integration-store";
import { cn } from "@/lib/utils";
import { ToolCallTrace } from "@/components/mcp/tool-call-trace";
import { colorBadge } from "@/components/mcp/server-chip";

const filters = ["all", "linkedin", "salesforce", "gmail", "google-calendar"] as const;

type FilterKey = (typeof filters)[number];

export function ToolCallStream() {
  const calls = useIntegrationStore((state) => state.toolCalls);
  const integrations = useIntegrationStore((state) => state.integrations);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      calls.filter((call) =>
        filter === "all" ? true : call.integrationId === filter
      ),
    [calls, filter]
  );

  const totalToday = calls.length;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Live Tool Calls</h2>
          <p className="flex items-center gap-1 text-xs text-emerald-400">
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-emerald-400"
            />
            Real-time
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((key) => {
            const integration = integrations.find((entry) => entry.id === key);
            const label = integration ? integration.name.split(" ")[0] : "All";
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs text-zinc-400 transition",
                  filter === key
                    ? integration
                      ? colorBadge[integration.color]
                      : "bg-indigo-500/10 text-indigo-300"
                    : "bg-zinc-800"
                )}
              >
                {label}
              </button>
            );
          })}
          <span className="text-xs text-zinc-500">{totalToday} calls today</span>
        </div>
      </div>

      <div className="custom-scrollbar max-h-[500px] overflow-y-auto px-6 py-2">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-zinc-500">
            No tool calls match this filter yet.
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((call) => (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b border-zinc-800/50 py-3"
              >
                <Row
                  call={call}
                  expanded={expandedId === call.id}
                  onToggle={() =>
                    setExpandedId((prev) => (prev === call.id ? null : call.id))
                  }
                />
                {expandedId === call.id ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3"
                  >
                    <ToolCallTrace call={call} />
                  </motion.div>
                ) : null}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function Row({
  call,
  expanded,
  onToggle,
}: {
  call: ToolCall;
  expanded: boolean;
  onToggle: () => void;
}) {
  const timestamp = new Date(call.startedAt).toLocaleTimeString("en-US", {
    hour12: false,
  });
  const StatusIcon =
    call.status === "success"
      ? CheckCircle2
      : call.status === "error"
      ? XCircle
      : Loader2;
  const statusColor =
    call.status === "success"
      ? "text-emerald-400"
      : call.status === "error"
      ? "text-red-400"
      : "text-amber-300";

  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-3 text-left"
    >
      <span className="w-16 font-mono text-[11px] text-zinc-500">
        {timestamp}
      </span>
      <StatusIcon
        size={14}
        className={cn(statusColor, call.status === "executing" && "animate-spin")}
      />
      <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-300">
        {call.triggeredBy}
      </span>
      <span className="text-zinc-600">→</span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[10px]",
          colorBadge[call.integrationColor]
        )}
      >
        {call.integrationName.split(" ")[0]}
      </span>
      <span className="text-zinc-600">→</span>
      <span className="font-mono text-xs text-indigo-300">{call.toolName}</span>
      <span className="truncate text-xs text-zinc-400">
        {call.leadName ? `• ${call.leadName}` : ""}
      </span>
      <span className="ml-auto font-mono text-[10px] text-zinc-500">
        {call.duration ? `${call.duration}ms` : "…"}
      </span>
      <span className="text-xs text-zinc-500">
        {expanded ? "Collapse" : "Expand"}
      </span>
    </button>
  );
}
