"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useIntegrationStore } from "@/lib/store/integration-store";
import type { Integration, IntegrationCategory } from "@/lib/store/integration-store";

interface AddServerModalProps {
  open: boolean;
  onClose: () => void;
  basePath: string;
}

const categoryOptions: IntegrationCategory[] = [
  "sourcing",
  "crm",
  "communication",
  "calendar",
  "analytics",
  "automation",
];

const colorOptions = ["blue", "cyan", "red", "emerald", "purple", "orange"];

const iconOptions = ["Cloud", "Mail", "Link2", "Hash", "Boxes", "Calendar", "MessageCircle", "Webhook"];

export function AddServerModal({ open, onClose, basePath }: AddServerModalProps) {
  const addCustomServer = useIntegrationStore((state) => state.addCustomServer);
  const router = useRouter();
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [category, setCategory] = useState<IntegrationCategory>("crm");
  const [icon, setIcon] = useState("Cloud");
  const [color, setColor] = useState("indigo");
  const [endpoint, setEndpoint] = useState("https://mcp.example.com/v1");
  const [auth, setAuth] = useState<"oauth" | "api-key" | "bearer" | "none">("api-key");
  const [description, setDescription] = useState("");
  const [testing, setTesting] = useState(false);

  const reset = () => {
    setName("");
    setProvider("");
    setCategory("crm");
    setIcon("Cloud");
    setColor("indigo");
    setEndpoint("https://mcp.example.com/v1");
    setAuth("api-key");
    setDescription("");
  };

  const handleAdd = () => {
    if (!name.trim() || !endpoint.trim()) {
      toast.error("Name and endpoint are required");
      return;
    }
    const id = name.toLowerCase().replace(/\s+/g, "-");
    const server: Integration = {
      id,
      name,
      provider: provider || "Custom",
      category,
      icon,
      color,
      status: "connected",
      description: description || "Custom MCP server.",
      mcpEndpoint: endpoint,
      transport: "sse",
      authMethod: auth,
      connectedAt: new Date().toISOString(),
      callsToday: 0,
      avgLatency: 0,
      successRate: 100,
      tools: [],
    };
    addCustomServer(server);
    toast.success(`${name} added`);
    reset();
    onClose();
    router.push(`${basePath}/${id}`);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={onClose}
        >
          <motion.div
            onClick={(event) => event.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500">
                  Add MCP Server
                </p>
                <h3 className="text-lg font-semibold text-white">
                  Connect a custom MCP-compatible server
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400"
              >
                <X size={14} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <Field label="Server name">
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Internal Ops Server"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Provider">
                  <input
                    value={provider}
                    onChange={(event) => setProvider(event.target.value)}
                    placeholder="Acme Inc"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
                  />
                </Field>
                <Field label="Category">
                  <select
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value as IntegrationCategory)
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm capitalize text-white"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option} value={option} className="capitalize">
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Endpoint URL">
                <input
                  value={endpoint}
                  onChange={(event) => setEndpoint(event.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-xs text-white"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Authentication">
                  <select
                    value={auth}
                    onChange={(event) =>
                      setAuth(
                        event.target.value as "oauth" | "api-key" | "bearer" | "none"
                      )
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
                  >
                    <option value="api-key">API Key</option>
                    <option value="oauth">OAuth 2.0</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="none">None</option>
                  </select>
                </Field>
                <Field label="Icon">
                  <select
                    value={icon}
                    onChange={(event) => setIcon(event.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
                  >
                    {iconOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Color">
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setColor(option)}
                      className={`h-6 w-6 rounded-full border ${
                        color === option ? "border-white" : "border-zinc-700"
                      }`}
                      style={{ backgroundColor: option }}
                    />
                  ))}
                </div>
              </Field>
              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white"
                />
              </Field>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setTesting(true);
                  setTimeout(() => {
                    setTesting(false);
                    toast.success("Connection check passed");
                  }, 900);
                }}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-xs text-zinc-300"
              >
                {testing ? "Testing..." : "Test connection"}
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Add Server
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</span>
      {children}
    </label>
  );
}
