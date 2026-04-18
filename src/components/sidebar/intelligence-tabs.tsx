import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabKey = "calendar" | "lookahead" | "debrief";

interface IntelligenceTabsProps {
  activeModeId?: string | null;
  onActionClick?: (label: string) => void;
}

export function IntelligenceTabs({
  activeModeId,
  onActionClick,
}: IntelligenceTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("calendar");

  const calendarItems = useMemo(
    () =>
      [
        {
          title: "Follow up with Acme Corp",
          time: "10:00 AM — Overdue by 2 days",
          note: "Email draft ready — needs your approval",
          color: "border-amber-500/60 text-amber-300",
        },
        {
          title: "Proposal deadline: TechNova",
          time: "11:30 AM — Due today",
          note: "Proposal not yet sent to decision maker",
          color: "border-red-500/60 text-red-300",
        },
        {
          title: "Call with Priya at DataVault",
          time: "2:00 PM — Confirmed",
          note: "Call script prepared. Talking points ready.",
          color: "border-emerald-500/60 text-emerald-300",
        },
        {
          title: "Lead review: Cold leads",
          time: "3:30 PM — 8 leads need attention",
          note: "3 leads inactive for 14+ days",
          color: "border-red-500/60 text-red-300",
        },
        {
          title: "Pipeline sync with team",
          time: "4:00 PM",
          note: "Weekly pipeline review ready.",
          color: "border-blue-500/60 text-blue-300",
        },
        {
          title: "Email campaign: Webinar follow-up",
          time: "5:00 PM — Scheduled",
          note: "42 emails queued for delivery",
          color: "border-emerald-500/60 text-emerald-300",
        },
      ],
    []
  );

  const lookaheadItems = useMemo(
    () => [
      {
        icon: AlertTriangle,
        title: "Send follow-up to Acme Corp — promised yesterday",
        note: "Draft is ready — needs your approval to send.",
        color: "border-amber-500/60 text-amber-300",
      },
      {
        icon: AlertTriangle,
        title: "Update proposal for TechNova before noon",
        note: "Decision maker reviewing competitor proposals too.",
        color: "border-amber-500/60 text-amber-300",
      },
      {
        icon: XCircle,
        title: "5 leads at risk — no response in 14+ days",
        note: "Classifier flagged 3 as likely to churn. Review and re-engage.",
        color: "border-red-500/60 text-red-300",
      },
      {
        icon: CheckCircle,
        title: "Call with DataVault at 2pm — fully prepped",
        note: "Script ready. No additional prep needed.",
        color: "border-emerald-500/60 text-emerald-300",
      },
    ],
    []
  );

  const debriefMetrics = [
    ["Emails sent", "47"],
    ["Emails opened", "31 (66%)"],
    ["Calls made", "18"],
    ["Meetings booked", "6"],
    ["Deals advanced", "4"],
    ["Deals lost", "1"],
    ["Response time avg", "3.2h"],
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center border-b border-zinc-800 text-sm">
        {(["calendar", "lookahead", "debrief"] as TabKey[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 px-4 py-2.5 text-sm capitalize transition",
              activeTab === tab
                ? "border-b-2 border-indigo-500 text-indigo-400"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto">
        {activeTab === "calendar" && (
          <div className="space-y-3 pb-4">
            <p className="px-4 pt-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Today
            </p>
            {calendarItems.map((item) => (
              <div
                key={item.title}
                className={cn(
                  "border-l-2 px-4 py-3",
                  item.color.replace("text-", "border-")
                )}
              >
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-xs text-zinc-400">{item.time}</p>
                <p className="text-xs text-zinc-500">{item.note}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "lookahead" && (
          <div className="space-y-3 pb-4">
            <p className="px-4 pt-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Today&apos;s Plan
            </p>
            {lookaheadItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="border-l-2 px-4 py-3">
                  <div className="flex items-start gap-2">
                    <Icon size={14} className={item.color.split(" ")[1]} />
                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="text-xs text-zinc-400">{item.note}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <p className="px-4 pt-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
              This Week
            </p>
            <div className="border-l-2 border-blue-500/60 px-4 py-3">
              <div className="flex items-start gap-2">
                <ArrowRight size={14} className="text-blue-300" />
                <div>
                  <p className="text-sm font-medium text-white">
                    Pipeline value dropped 8% — 3 deals stalled
                  </p>
                  <p className="text-xs text-zinc-400">
                    Negotiation stage bottleneck. Consider escalation.
                  </p>
                </div>
              </div>
            </div>
            <div className="mx-4 rounded-xl border-l-2 border-indigo-400 bg-indigo-500/5 px-4 py-3 text-sm italic text-zinc-300">
              Focus on the 5 at-risk leads first — recovering even 2 would add $45K
              back to pipeline.
            </div>
            <button
              type="button"
              onClick={() => onActionClick?.("Customize with instructions")}
              className="px-4 text-xs text-indigo-400 hover:text-indigo-300"
            >
              Customize with instructions →
            </button>
          </div>
        )}

        {activeTab === "debrief" && (
          <div className="space-y-3 pb-4">
            <p className="px-4 pt-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Last Week — Performance
            </p>
            <div className="mx-4 rounded-xl bg-zinc-800/30 p-4 text-sm text-zinc-300">
              {debriefMetrics.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-1">
                  <span className="text-xs text-zinc-400">{label}</span>
                  <span className={cn(label.includes("Response") && "font-semibold")}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <p className="px-4 pt-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Patterns Noticed
            </p>
            <div className="border-l-2 border-red-500/60 px-4 py-3">
              <div className="flex items-start gap-2">
                <XCircle size={14} className="text-red-300" />
                <div>
                  <p className="text-sm font-medium text-white">
                    Cold leads spiking on Mondays
                  </p>
                  <p className="text-xs text-zinc-400">
                    4 of last 5 Mondays had 3+ leads go cold. Consider Monday
                    re-engagement.
                  </p>
                </div>
              </div>
            </div>
            <div className="border-l-2 border-blue-500/60 px-4 py-3">
              <div className="flex items-start gap-2">
                <ArrowRight size={14} className="text-blue-300" />
                <div>
                  <p className="text-sm font-medium text-white">
                    LinkedIn leads converting 2x faster
                  </p>
                  <p className="text-xs text-zinc-400">
                    Avg 8 days to qualified vs 18 days for Google Ads.
                  </p>
                </div>
              </div>
            </div>
            <div className="mx-4 rounded-xl border-l-2 border-indigo-400 bg-indigo-500/5 px-4 py-3 text-sm italic text-zinc-300">
              Response time increased from 2.1h to 3.2h — mostly due to
              Thursday/Friday delays.
            </div>
            <button
              type="button"
              onClick={() => onActionClick?.("Customize with instructions")}
              className="px-4 text-xs text-indigo-400 hover:text-indigo-300"
            >
              Customize with instructions →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
