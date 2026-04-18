"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight, Zap } from "lucide-react";
import type { ToolCall } from "@/lib/store/integration-store";
import { cn } from "@/lib/utils";
import {
  colorBadge,
  iconMap,
} from "@/components/mcp/server-chip";

interface ToolCallTraceProps {
  call: ToolCall;
  compact?: boolean;
}

export function ToolCallTrace({ call, compact }: ToolCallTraceProps) {
  const [inputOpen, setInputOpen] = useState(!compact);
  const [outputOpen, setOutputOpen] = useState(!compact);

  const Icon = iconMap[call.integrationColor as keyof typeof iconMap];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4"
    >
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-zinc-400">
          <Zap size={12} className="text-amber-300" />
          MCP Tool Call
        </p>
        {call.duration ? (
          <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-[10px] font-mono text-zinc-200">
            {call.duration}ms
          </span>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-[auto_auto_auto_1fr] sm:items-center">
        <span className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200">
          {call.triggeredBy}
        </span>
        <span className="text-zinc-500">→</span>
        <span
          className={cn(
            "rounded-lg border px-3 py-2 text-xs",
            colorBadge[call.integrationColor]
          )}
        >
          <span className="flex items-center gap-2">
            {Icon ? <Icon size={12} /> : null}
            {call.integrationName}
          </span>
        </span>
        <span className="rounded-lg border border-zinc-600 bg-zinc-700/40 px-3 py-2 font-mono text-xs text-indigo-300">
          {call.toolName}()
        </span>
      </div>

      <Section
        label="Input"
        open={inputOpen}
        onToggle={() => setInputOpen((v) => !v)}
        payload={call.input}
      />

      <Section
        label="Output"
        open={outputOpen}
        onToggle={() => setOutputOpen((v) => !v)}
        payload={call.output ?? {}}
        status={call.status}
      />
    </motion.div>
  );
}

function Section({
  label,
  open,
  onToggle,
  payload,
  status,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  payload: Record<string, unknown>;
  status?: ToolCall["status"];
}) {
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between text-[10px] uppercase tracking-widest text-zinc-500"
      >
        <span className="flex items-center gap-1">
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          {label}
        </span>
        {status ? (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px]",
              status === "success" && "bg-emerald-500/10 text-emerald-300",
              status === "error" && "bg-red-500/10 text-red-300",
              status === "executing" && "bg-amber-500/10 text-amber-300"
            )}
          >
            {status}
          </span>
        ) : null}
      </button>
      {open ? (
        <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-zinc-900 p-3 text-[11px] text-zinc-300">
          {JSON.stringify(payload, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
