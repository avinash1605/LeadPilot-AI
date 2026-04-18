"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Play } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Integration, IntegrationTool } from "@/lib/store/integration-store";
import { useIntegrationStore } from "@/lib/store/integration-store";
import { ToolTester } from "@/components/mcp/tool-tester";

interface ToolCardProps {
  integration: Integration;
  tool: IntegrationTool;
}

export function ToolCard({ integration, tool }: ToolCardProps) {
  const toggleTool = useIntegrationStore((state) => state.toggleTool);
  const [expanded, setExpanded] = useState(false);
  const [testing, setTesting] = useState(false);

  return (
    <>
      <motion.div
        layout
        className={cn(
          "mb-3 rounded-xl border border-zinc-700 bg-zinc-800/50 transition",
          !tool.enabled && "opacity-60"
        )}
      >
        <div className="flex items-center gap-3 p-4">
          <button
            type="button"
            onClick={() => {
              toggleTool(integration.id, tool.id);
              toast[tool.enabled ? "info" : "success"](
                `${tool.enabled ? "⏸" : "✅"} ${tool.name} ${
                  tool.enabled ? "disabled" : "enabled"
                }`
              );
            }}
            className={cn(
              "relative h-6 w-10 rounded-full border transition",
              tool.enabled
                ? "border-indigo-500 bg-indigo-500/30"
                : "border-zinc-700 bg-zinc-800"
            )}
          >
            <span
              className={cn(
                "absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white transition-all",
                tool.enabled ? "left-5" : "left-1"
              )}
            />
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "font-mono text-sm",
                  tool.enabled ? "text-indigo-300" : "text-zinc-500"
                )}
              >
                {tool.name}
              </span>
              <span className="text-xs text-zinc-500">{tool.description}</span>
            </div>
          </div>

          <span className="text-xs text-zinc-500">{tool.usageCount} calls</span>
          <button
            type="button"
            onClick={() => setTesting(true)}
            className="flex items-center gap-1 rounded-lg border border-indigo-500/30 px-2.5 py-1 text-xs text-indigo-300 hover:bg-indigo-500/10"
          >
            <Play size={12} />
            Test
          </button>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        <AnimatePresence>
          {expanded ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 border-t border-zinc-800 bg-zinc-900/40 px-4 pb-5 pt-4"
            >
              <Section label="Parameters">
                <div className="overflow-hidden rounded-lg border border-zinc-800">
                  <table className="w-full text-xs">
                    <thead className="bg-zinc-800/80 text-[10px] uppercase tracking-widest text-zinc-500">
                      <tr>
                        <th className="px-3 py-2 text-left">Name</th>
                        <th className="px-3 py-2 text-left">Type</th>
                        <th className="px-3 py-2 text-left">Required</th>
                        <th className="px-3 py-2 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tool.parameters.map((param) => (
                        <tr
                          key={param.name}
                          className="border-t border-zinc-800/60 text-zinc-400"
                        >
                          <td className="px-3 py-2 font-mono text-indigo-300">
                            {param.name}
                          </td>
                          <td className="px-3 py-2">
                            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-amber-300">
                              {param.type}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {param.required ? (
                              <span className="text-emerald-400">✓ Yes</span>
                            ) : (
                              <span className="text-zinc-600">✗ No</span>
                            )}
                          </td>
                          <td className="px-3 py-2">{param.description ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              {tool.example ? (
                <>
                  <Section label="Example request">
                    <pre className="rounded-lg bg-zinc-900 p-3 font-mono text-xs text-zinc-300">
                      {JSON.stringify(tool.example.request, null, 2)}
                    </pre>
                  </Section>
                  <Section label="Example response">
                    <pre className="rounded-lg bg-zinc-900 p-3 font-mono text-xs text-emerald-300">
                      {JSON.stringify(tool.example.response, null, 2)}
                    </pre>
                  </Section>
                </>
              ) : null}

              <Section label="Used by">
                <div className="flex flex-wrap gap-2 text-[11px] text-zinc-300">
                  <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-indigo-300">
                    Copilot
                  </span>
                  {["Outreach Agent", "Monitor Agent", "Research Agent"].map((agent) => (
                    <span
                      key={agent}
                      className="rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-300"
                    >
                      {agent}
                    </span>
                  ))}
                </div>
              </Section>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
      {testing ? (
        <ToolTester
          tool={tool}
          integration={integration}
          onClose={() => setTesting(false)}
        />
      ) : null}
    </>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      {children}
    </div>
  );
}
