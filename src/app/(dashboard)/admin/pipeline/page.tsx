"use client";

import { useMemo } from "react";
import { PipelineFunnel } from "@/components/dashboard/pipeline-funnel";
import { useLeadStore } from "@/lib/store/lead-store";
import type { Lead } from "@/lib/types";

const stages: Lead["stage"][] = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

export default function AdminPipelinePage() {
  const leads = useLeadStore((state) => state.leads);

  const stageSummary = useMemo(() => {
    return stages.map((stage) => {
      const items = leads.filter((lead) => lead.stage === stage);
      const value = items.reduce((sum, lead) => sum + lead.value, 0);
      return { stage, count: items.length, value };
    });
  }, [leads]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Pipeline Overview</h1>
        <p className="text-sm text-zinc-400">
          Company-wide pipeline health and stage velocity.
        </p>
      </div>

      <PipelineFunnel />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stageSummary.map((stage) => (
          <div
            key={stage.stage}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              {stage.stage}
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">{stage.count}</p>
            <p className="text-sm text-zinc-400">
              ${stage.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
