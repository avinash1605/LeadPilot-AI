"use client";

import { AlertTriangle } from "lucide-react";
import type { Lead } from "@/lib/types";
import { cn } from "@/lib/utils";

const temperatureBorder: Record<Lead["temperature"], string> = {
  hot: "border-l-indigo-500",
  warm: "border-l-amber-500",
  cold: "border-l-zinc-600",
};

interface PipelineCardProps {
  lead: Lead;
  stages: Lead["stage"][];
  onMove: (stage: Lead["stage"]) => void;
  onOpen: () => void;
}

export function PipelineCard({ lead, stages, onMove, onOpen }: PipelineCardProps) {
  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/lead-id", lead.id);
        event.dataTransfer.effectAllowed = "move";
        event.currentTarget.classList.add("opacity-60");
      }}
      onDragEnd={(event) => {
        event.currentTarget.classList.remove("opacity-60");
      }}
      className={cn(
        "relative mb-3 cursor-grab rounded-xl border border-zinc-700 bg-zinc-800 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/20 active:cursor-grabbing",
        `border-l-4 ${temperatureBorder[lead.temperature]}`
      )}
      onClick={onOpen}
    >
      {lead.riskFlag ? (
        <AlertTriangle size={14} className="absolute right-3 top-3 text-red-400" />
      ) : null}
      <p className="text-sm font-medium text-white">{lead.name}</p>
      <p className="text-xs text-zinc-400">{lead.company}</p>
      <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
        <span className="text-sm font-medium text-zinc-200">
          ${lead.value.toLocaleString()}
        </span>
        <span
          className={cn(
            "rounded-full bg-zinc-700 px-2 py-0.5",
            lead.score > 80 && "score-pulse"
          )}
        >
          Score {lead.score}
        </span>
      </div>
      <p className="mt-2 text-xs text-zinc-500">Days in stage: {lead.score % 12}</p>
      <select
        defaultValue=""
        onClick={(event) => event.stopPropagation()}
        onChange={(event) => {
          if (event.target.value) {
            onMove(event.target.value as Lead["stage"]);
          }
        }}
        className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-300"
      >
        <option value="" disabled>
          Move to...
        </option>
        {stages
          .filter((stage) => stage !== lead.stage)
          .map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
      </select>
    </div>
  );
}
