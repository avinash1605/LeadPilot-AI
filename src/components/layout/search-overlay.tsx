"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useLeadStore } from "@/lib/store/lead-store";
import { useUiStore } from "@/lib/store/ui-store";
import { cn } from "@/lib/utils";

export function SearchOverlay() {
  const { leads } = useLeadStore();
  const { searchOpen, setSearchOpen } = useUiStore();
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [temperatureFilter, setTemperatureFilter] = useState("all");

  useEffect(() => {
    const handler = () => setSearchOpen(false);
    window.addEventListener("leadpilot:close-overlays", handler);
    return () => window.removeEventListener("leadpilot:close-overlays", handler);
  }, [setSearchOpen]);

  useEffect(() => {
    if (!searchOpen) {
      setQuery("");
      setSourceFilter("all");
      setTemperatureFilter("all");
    }
  }, [searchOpen]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (sourceFilter !== "all" && lead.source !== sourceFilter) return false;
      if (temperatureFilter !== "all" && lead.temperature !== temperatureFilter)
        return false;
      if (!term) return true;
      const haystack = `${lead.name} ${lead.company} ${lead.email}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [leads, query, sourceFilter, temperatureFilter]);

  const sources = useMemo(() => {
    const unique = Array.from(new Set(leads.map((lead) => lead.source)));
    return ["all", ...unique];
  }, [leads]);

  const temperatures = ["all", "hot", "warm", "cold"];

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 px-6 pt-24">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-zinc-800 px-5 py-4">
          <Search size={18} className="text-zinc-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search leads, companies, notes..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
            autoFocus
          />
          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-300"
          >
            {sources.map((source) => (
              <option key={source} value={source} className="bg-zinc-900">
                {source === "all" ? "All sources" : source.replace("_", " ")}
              </option>
            ))}
          </select>
          <select
            value={temperatureFilter}
            onChange={(event) => setTemperatureFilter(event.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-300"
          >
            {temperatures.map((temp) => (
              <option key={temp} value={temp} className="bg-zinc-900">
                {temp === "all" ? "All temps" : temp}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-zinc-500">
              No leads found for “{query}”.
            </div>
          ) : (
            <ul className="divide-y divide-zinc-800">
              {results.map((lead) => (
                <li
                  key={lead.id}
                  className="px-5 py-4 transition hover:bg-zinc-900/60"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{lead.name}</p>
                      <p className="text-xs text-zinc-400">{lead.company}</p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider",
                        lead.temperature === "hot" && "bg-red-500/10 text-red-300",
                        lead.temperature === "warm" && "bg-amber-500/10 text-amber-300",
                        lead.temperature === "cold" && "bg-blue-500/10 text-blue-300"
                      )}
                    >
                      {lead.temperature}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    {lead.title} · {lead.email}
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    Source: {lead.source.replace("_", " ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-zinc-800 px-5 py-3 text-xs text-zinc-500">
          <span>Press Esc to close</span>
          <span>Cmd + K</span>
        </div>
      </div>
    </div>
  );
}
