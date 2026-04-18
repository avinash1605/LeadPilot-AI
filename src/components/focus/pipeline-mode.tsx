"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import type { Lead } from "@/lib/types";
import { useAuthStore } from "@/lib/store/auth-store";
import { useLeadStore } from "@/lib/store/lead-store";
import { PipelineCard } from "@/components/focus/pipeline-card";
import { cn } from "@/lib/utils";

const stages: Lead["stage"][] = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

const stageLabels: Record<Lead["stage"], string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

const temperatureFilters: Array<Lead["temperature"] | "all"> = [
  "all",
  "hot",
  "warm",
  "cold",
];

export function PipelineMode() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const allLeads = useLeadStore((state) => state.leads);
  const updateLeadStage = useLeadStore((state) => state.updateLeadStage);
  const [filter, setFilter] = useState<Lead["temperature"] | "all">("all");
  const [modalLead, setModalLead] = useState<Lead | null>(null);

  const leads = useMemo(() => {
    if (!currentUser) return [];
    return allLeads
      .filter((lead) => lead.assignedTo === currentUser.id)
      .filter((lead) => (filter === "all" ? true : lead.temperature === filter));
  }, [allLeads, currentUser, filter]);

  const columns = stages.map((stage) => ({
    stage,
    leads: leads.filter((lead) => lead.stage === stage),
    value: leads
      .filter((lead) => lead.stage === stage)
      .reduce((sum, lead) => sum + lead.value, 0),
  }));

  const handleMove = (lead: Lead, stage: Lead["stage"]) => {
    updateLeadStage(lead.id, stage);
    toast.success(`Lead stage changed to ${stageLabels[stage]}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {temperatureFilters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              "rounded-lg border border-zinc-700 px-3 py-1 text-sm text-zinc-400 transition",
              filter === item && "border-indigo-500 bg-indigo-500/10 text-indigo-300"
            )}
          >
            {item === "all" ? "All" : item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      <div className="custom-scrollbar flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div
            key={column.stage}
            onDragOver={(event) => {
              event.preventDefault();
              event.currentTarget.classList.add("ring-1", "ring-indigo-500/40");
            }}
            onDragLeave={(event) => {
              event.currentTarget.classList.remove("ring-1", "ring-indigo-500/40");
            }}
            onDrop={(event) => {
              event.preventDefault();
              event.currentTarget.classList.remove("ring-1", "ring-indigo-500/40");
              const leadId = event.dataTransfer.getData("text/lead-id");
              if (!leadId) return;
              const lead = leads.find((entry) => entry.id === leadId);
              if (!lead || lead.stage === column.stage) return;
              handleMove(lead, column.stage);
            }}
            className={cn(
              "min-w-[280px] flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition",
              column.stage === "won" && "bg-green-500/5",
              column.stage === "lost" && "bg-red-500/5"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  {stageLabels[column.stage]}
                </p>
                <span className="mt-1 inline-flex rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-300">
                  {column.leads.length}
                </span>
              </div>
              <span className="text-xs text-zinc-500">
                ${column.value.toLocaleString()}
              </span>
            </div>
            <div className="mt-4">
              {column.leads.map((lead) => (
                <PipelineCard
                  key={lead.id}
                  lead={lead}
                  stages={stages}
                  onMove={(stage) => handleMove(lead, stage)}
                  onOpen={() => setModalLead(lead)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {modalLead ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {modalLead.name}
              </h3>
              <button
                type="button"
                onClick={() => setModalLead(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400"
              >
                <X size={16} />
              </button>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              {modalLead.title} · {modalLead.company}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-zinc-300">
              <div>Score: {modalLead.score}</div>
              <div>Temperature: {modalLead.temperature}</div>
              <div>Deal value: ${modalLead.value.toLocaleString()}</div>
              <div>Stage: {stageLabels[modalLead.stage]}</div>
            </div>
            <div className="mt-4 space-y-2 text-xs text-zinc-500">
              <p>Stage history</p>
              <ul className="space-y-1">
                <li>New → Contacted · 7 days ago</li>
                <li>Contacted → Qualified · 5 days ago</li>
                <li>Qualified → {stageLabels[modalLead.stage]} · 2 days ago</li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      <div className="sr-only" aria-live="polite" />
    </div>
  );
}
