"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { useLeadStore } from "@/lib/store/lead-store";
import { users } from "@/lib/mock-data/users";

const sources = [
  { label: "All Sources", value: null },
  { label: "LinkedIn", value: "linkedin" },
  { label: "Google Ads", value: "google_ads" },
  { label: "Webinar", value: "webinar" },
  { label: "Referral", value: "referral" },
  { label: "Cold Outreach", value: "cold_outreach" },
];

const stages = [
  { label: "All Stages", value: null },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Qualified", value: "qualified" },
  { label: "Proposal", value: "proposal" },
  { label: "Negotiation", value: "negotiation" },
  { label: "Won", value: "won" },
  { label: "Lost", value: "lost" },
  { label: "Cold", value: "cold" },
];

const temps = [
  { label: "All Temps", value: null },
  { label: "Hot", value: "hot" },
  { label: "Warm", value: "warm" },
  { label: "Cold", value: "cold" },
];

const reps = [
  { label: "All Reps", value: null },
  ...users
    .filter((user) => user.role === "user")
    .map((user) => ({ label: user.name, value: user.id })),
];

interface LeadsToolbarProps {
  sort: string;
  onSortChange: (value: string) => void;
}

export function LeadsToolbar({ sort, onSortChange }: LeadsToolbarProps) {
  const { filters, setFilter, clearFilters } = useLeadStore();
  const [search, setSearch] = useState(filters.search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilter("search", search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search, setFilter]);

  const activeFilters = useMemo(() => {
    const list = [];
    const sourceLabel = sources.find((item) => item.value === filters.source)?.label;
    const stageLabel = stages.find((item) => item.value === filters.stage)?.label;
    const tempLabel = temps.find((item) => item.value === filters.temperature)?.label;
    const repLabel = reps.find((item) => item.value === filters.assignedTo)?.label;
    if (filters.source && sourceLabel) list.push({ key: "source", label: `Source: ${sourceLabel}` });
    if (filters.stage && stageLabel) list.push({ key: "stage", label: `Stage: ${stageLabel}` });
    if (filters.temperature && tempLabel)
      list.push({ key: "temperature", label: `Temp: ${tempLabel}` });
    if (filters.assignedTo && repLabel)
      list.push({ key: "assignedTo", label: `Rep: ${repLabel}` });
    return list;
  }, [filters]);

  const removeFilter = (key: string) => {
    setFilter(key as keyof typeof filters, null);
  };

  const handleExport = () => {
    toast.info("📥 Export started — this is a demo, no file will be generated");
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex min-w-[250px] flex-1 items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2">
          <Search size={16} className="text-zinc-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, company, or email..."
            className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
          />
        </div>

        <select
          value={filters.source ?? ""}
          onChange={(event) => setFilter("source", event.target.value || null)}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 focus:border-indigo-500/50"
        >
          {sources.map((option) => (
            <option key={option.label} value={option.value ?? ""}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.stage ?? ""}
          onChange={(event) => setFilter("stage", event.target.value || null)}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 focus:border-indigo-500/50"
        >
          {stages.map((option) => (
            <option key={option.label} value={option.value ?? ""}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.temperature ?? ""}
          onChange={(event) => setFilter("temperature", event.target.value || null)}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 focus:border-indigo-500/50"
        >
          {temps.map((option) => (
            <option key={option.label} value={option.value ?? ""}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.assignedTo ?? ""}
          onChange={(event) => setFilter("assignedTo", event.target.value || null)}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 focus:border-indigo-500/50"
        >
          {reps.map((option) => (
            <option key={option.label} value={option.value ?? ""}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Sort by</span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 focus:border-indigo-500/50"
          >
            <option value="score-desc">Score (High → Low)</option>
            <option value="score-asc">Score (Low → High)</option>
            <option value="recent">Recent Activity</option>
            <option value="value-desc">Deal Value (High → Low)</option>
            <option value="created-desc">Created Date (Newest)</option>
            <option value="name-asc">Name (A-Z)</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="ml-auto inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {activeFilters.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-1 text-indigo-400"
            >
              {filter.label}
              <button
                type="button"
                onClick={() => removeFilter(filter.key)}
                className="text-indigo-300"
              >
                ×
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            Clear all
          </button>
        </div>
      ) : null}

      <div className="sr-only" aria-live="polite" />
    </div>
  );
}
