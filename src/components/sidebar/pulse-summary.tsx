"use client";

import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { focusModes } from "@/lib/mock-data/focus-modes";
import { useIntegrationStore } from "@/lib/store/integration-store";

type PulseCategory = "alerts" | "actions" | "insights";

interface PulseSummaryProps {
  activeModeId?: string | null;
  onCategoryClick?: (category: PulseCategory) => void;
}

const defaultPulse = {
  alerts: [
    "Lead Maya Singh — overdue follow-up by 5 days",
    "Deal PolarShift stuck in negotiation for 21 days",
    "Risk: Daniel Cho — competitor mentioned",
    "Critical: Arjun Patel score dropped below 20",
  ],
  actions: [
    "Draft email for Priya Shah — AI ready",
    "Call Ravi Kumar — overdue callback",
    "Send proposal to Acme Corp",
  ],
  insights: [
    "Conversion rate up 12% this week",
    "LinkedIn leads outperforming ads by 2x",
    "Best email open rates on Tuesday 10am",
  ],
};

const modeOverrides: Record<string, Partial<typeof defaultPulse>> = {
  "lead-emailing": {
    alerts: [
      "Unopened email: Priya Shah — 4 days",
      "Bounce detected: Leo Thomas — verify address",
    ],
    actions: ["Review drafts — 3 emails ready", "Send sequence to PolarShift"],
  },
  "lead-calling": {
    alerts: ["Missed callback: Riya Mehta", "Voicemail: Anuj Verma"],
    actions: ["Prep script for Acme Corp", "Call back TechNova lead"],
  },
  "pipeline-review": {
    alerts: ["Deal DataVault stuck in proposal 18 days", "Stage timeout: NovaShip"],
    actions: ["Advance 3 qualified deals", "Send proposal to Zephyr"],
    insights: ["Pipeline velocity down 6% this week"],
  },
  "lead-research": {
    alerts: ["Research pending: Beacon Labs", "No enrichment data for DynaTech"],
    insights: ["Competitive intel: TechNova funding round"],
  },
  "follow-up-queue": {
    alerts: ["Overdue follow-up: Priya Shah", "Overdue follow-up: Rahul Mehta"],
    actions: ["Follow up with 6 leads today", "Snooze low priority leads"],
  },
};

export function PulseSummary({ activeModeId, onCategoryClick }: PulseSummaryProps) {
  const modeLabel = focusModes.find((mode) => mode.id === activeModeId)?.name;
  const integrations = useIntegrationStore((state) => state.integrations);
  const connected = integrations.filter((item) => item.status === "connected");
  const dotColor: Record<string, string> = {
    blue: "bg-blue-400",
    cyan: "bg-cyan-400",
    red: "bg-red-400",
    emerald: "bg-emerald-400",
    purple: "bg-purple-400",
    orange: "bg-orange-400",
  };
  const pulse = useMemo(() => {
    if (!activeModeId) return defaultPulse;
    const overrides = modeOverrides[activeModeId] ?? {};
    return {
      alerts: overrides.alerts ?? defaultPulse.alerts,
      actions: overrides.actions ?? defaultPulse.actions,
      insights: overrides.insights ?? defaultPulse.insights,
    };
  }, [activeModeId]);

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          Pulse Summary
        </p>
        <div className="flex items-center gap-2">
          {modeLabel ? (
            <span className="text-[10px] text-zinc-500">{modeLabel}</span>
          ) : null}
          <button
            type="button"
            onClick={() =>
              toast.info("Pulse surfaces alerts, actions, and insights for your day.")
            }
            className="text-[10px] text-indigo-400 hover:text-indigo-300"
          >
            What is this?
          </button>
        </div>
      </div>

      <div
        className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2"
        title={connected.map((item) => `${item.name} connected`).join("\n")}
      >
        <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">
          MCP
        </span>
        <div className="flex items-center gap-1">
          {connected.map((integration) => (
            <span
              key={integration.id}
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                dotColor[integration.color] ?? "bg-zinc-500"
              )}
            />
          ))}
        </div>
        <span className="ml-auto text-[10px] text-zinc-500">
          {connected.length}/{integrations.length} connected
        </span>
      </div>

      <div className="space-y-3">
        <PulseSection
          title="Alerts"
          color="text-red-400"
          count={pulse.alerts.length}
          items={pulse.alerts}
          onClick={() => onCategoryClick?.("alerts")}
        />
        <PulseSection
          title="Actions"
          color="text-blue-400"
          count={pulse.actions.length}
          items={pulse.actions}
          onClick={() => onCategoryClick?.("actions")}
        />
        <PulseSection
          title="Insights"
          color="text-indigo-400"
          count={pulse.insights.length}
          items={pulse.insights}
          onClick={() => onCategoryClick?.("insights")}
        />
      </div>

      <button
        type="button"
        onClick={() => onCategoryClick?.("insights")}
        className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
      >
        ← Full Pulse
        <ChevronRight size={12} />
      </button>
    </div>
  );
}

function PulseSection({
  title,
  color,
  count,
  items,
  onClick,
}: {
  title: string;
  color: string;
  count: number;
  items: string[];
  onClick?: () => void;
}) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between text-sm font-semibold text-zinc-200"
      >
        <span className={cn(color)}>{title}</span>
        <span className="text-xs text-zinc-500">({count})</span>
      </button>
      <div className="space-y-1">
        {items.slice(0, 4).map((item) => (
          <button
            type="button"
            key={item}
            onClick={onClick}
            className="block w-full truncate text-left text-xs text-zinc-400 hover:text-zinc-200"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
