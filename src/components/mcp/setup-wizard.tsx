"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Integration } from "@/lib/store/integration-store";
import { useIntegrationStore } from "@/lib/store/integration-store";

const steps = ["Choose Auth", "Configure", "Test & Connect"];

const progressStages = [
  "Connecting to MCP endpoint...",
  "Authenticating...",
  "Discovering tools...",
  "Running health check...",
];

interface SetupWizardProps {
  integration: Integration;
  onComplete?: () => void;
}

export function SetupWizard({ integration, onComplete }: SetupWizardProps) {
  const connect = useIntegrationStore((state) => state.connectServer);
  const [step, setStep] = useState(0);
  const [authMethod, setAuthMethod] = useState<"oauth" | "api-key">("oauth");
  const [progress, setProgress] = useState<number[]>([]);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (step !== 2) return;
    setProgress([]);
    progressStages.forEach((_, index) => {
      setTimeout(() => {
        setProgress((prev) => [...prev, index]);
      }, (index + 1) * 700);
    });
    const total = progressStages.length * 700 + 400;
    const timer = setTimeout(() => {
      connect(integration.id);
      toast.success(`${integration.name} connected`);
      onComplete?.();
    }, total);
    return () => clearTimeout(timer);
  }, [step, integration.id, connect, onComplete]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center gap-3">
        {steps.map((label, index) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs",
                index < step
                  ? "bg-emerald-500/10 text-emerald-400"
                  : index === step
                  ? "animate-pulse bg-indigo-500 text-white"
                  : "bg-zinc-800 text-zinc-500"
              )}
            >
              {index + 1}
            </span>
            <span className="text-xs text-zinc-400">{label}</span>
            {index < steps.length - 1 ? (
              <span className="h-px flex-1 bg-zinc-800" />
            ) : null}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mt-6"
        >
          {step === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-zinc-300">
                Choose how to connect to {integration.name}.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {(["oauth", "api-key"] as const).map((method) => {
                  const Icon = method === "oauth" ? ShieldCheck : KeyRound;
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setAuthMethod(method)}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-xl border px-4 py-4 text-left text-sm",
                        authMethod === method
                          ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-100"
                          : "border-zinc-700 bg-zinc-800 text-zinc-300"
                      )}
                    >
                      <Icon size={18} />
                      <p className="font-medium">
                        {method === "oauth" ? "OAuth 2.0" : "API Key"}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {method === "oauth"
                          ? "Recommended — sign in with your account"
                          : "Paste an existing API key"}
                      </p>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-sm text-white"
                >
                  Next →
                </button>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-4">
              <p className="text-sm text-zinc-300">
                Configure {integration.name} authentication.
              </p>
              {authMethod === "oauth" ? (
                <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-4 text-sm text-zinc-200">
                  <p className="font-medium text-white">Sign in with provider</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    In production this opens the provider’s OAuth flow and requests the
                    scopes LeadPilot needs.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs text-zinc-400">API Key</label>
                  <input
                    value={apiKey}
                    onChange={(event) => setApiKey(event.target.value)}
                    placeholder="sk-••••••••"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm text-white"
                  />
                </div>
              )}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-xs text-zinc-300"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-sm text-white"
                >
                  Test & Connect →
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <p className="text-sm text-zinc-300">
                Validating connection to {integration.name}…
              </p>
              <div className="space-y-2">
                {progressStages.map((stage, index) => {
                  const done = progress.includes(index);
                  return (
                    <div
                      key={stage}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs",
                        done ? "text-emerald-300" : "text-zinc-400"
                      )}
                    >
                      {done ? (
                        <CheckCircle2 size={14} className="text-emerald-400" />
                      ) : (
                        <Loader2 size={14} className="animate-spin text-amber-300" />
                      )}
                      {stage}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
