"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Integration, IntegrationTool } from "@/lib/store/integration-store";

interface ToolTesterProps {
  tool: IntegrationTool;
  integration: Integration;
  onClose: () => void;
}

export function ToolTester({ tool, integration, onClose }: ToolTesterProps) {
  const defaultValues = useMemo(() => {
    const initial: Record<string, string> = {};
    tool.parameters.forEach((param) => {
      const example =
        tool.example?.request?.[param.name as keyof typeof tool.example.request];
      initial[param.name] =
        typeof example === "string"
          ? example
          : example !== undefined
          ? JSON.stringify(example)
          : "";
    });
    return initial;
  }, [tool]);

  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  const runTest = async () => {
    setRunning(true);
    setOutput(null);
    setDuration(null);
    const start = performance.now();
    await new Promise((resolve) =>
      setTimeout(resolve, 900 + Math.random() * 600)
    );
    const end = performance.now();
    const sample = tool.example?.response ?? {
      status: "ok",
      message: "Test succeeded",
    };
    setOutput(JSON.stringify(sample, null, 2));
    setDuration(Math.round(end - start));
    setRunning(false);
    toast.success(`${tool.name} test executed`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                Test Tool · {integration.name}
              </p>
              <h3 className="font-mono text-lg text-white">{tool.name}()</h3>
              <p className="text-xs text-zinc-400">{tool.description}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            {tool.parameters.map((param) => (
              <label key={param.name} className="flex flex-col gap-1">
                <span className="flex items-center gap-2 font-mono text-xs text-zinc-300">
                  {param.name}
                  <span className="rounded bg-amber-500/10 px-1 py-0.5 text-[9px] text-amber-300">
                    {param.type}
                  </span>
                  {param.required ? (
                    <span className="text-[9px] text-emerald-400">required</span>
                  ) : (
                    <span className="text-[9px] text-zinc-500">optional</span>
                  )}
                </span>
                <textarea
                  rows={param.type.includes("object") ? 3 : 1}
                  value={values[param.name] ?? ""}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      [param.name]: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-zinc-700 bg-zinc-900 p-2 font-mono text-xs text-zinc-200"
                />
                {param.description ? (
                  <span className="text-[10px] text-zinc-500">{param.description}</span>
                ) : null}
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={runTest}
            disabled={running}
            className={cn(
              "mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white transition",
              running && "opacity-70"
            )}
          >
            {running ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Executing...
              </span>
            ) : (
              "Run Test"
            )}
          </button>

          <div className="mt-4 space-y-3">
            <Section label="Request">
              <pre className="max-h-40 overflow-auto text-xs text-zinc-200">
                {JSON.stringify(
                  {
                    tool: tool.name,
                    parameters: values,
                  },
                  null,
                  2
                )}
              </pre>
            </Section>

            <Section
              label={running ? "Executing..." : output ? `Response (${duration}ms)` : "Response"}
              status={output ? "200 OK" : undefined}
            >
              {running ? (
                <p className="flex items-center gap-2 text-xs text-zinc-400">
                  <Loader2 size={14} className="animate-spin" /> Awaiting response...
                </p>
              ) : output ? (
                <pre className="max-h-48 overflow-auto text-xs text-emerald-300">
                  {output}
                </pre>
              ) : (
                <p className="text-xs text-zinc-500">Run a test to see output here.</p>
              )}
            </Section>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Section({
  label,
  status,
  children,
}: {
  label: string;
  status?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500">
          {label}
        </span>
        {status ? (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
            {status}
          </span>
        ) : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
