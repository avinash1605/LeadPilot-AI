"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow, differenceInDays, parseISO } from "date-fns";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/auth-store";
import { useLeadStore } from "@/lib/store/lead-store";
import { cn } from "@/lib/utils";

const outcomes = [
  "Connected",
  "Voicemail",
  "No Answer",
  "Meeting Booked",
  "Call Back Later",
];

export function CallMode() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const { getLeadsForUser, selectLead, selectedLead } = useLeadStore();
  const [notes, setNotes] = useState("");
  const [outcome, setOutcome] = useState(outcomes[0]);

  const queue = useMemo(() => {
    if (!currentUser) return [];
    return getLeadsForUser(currentUser.id)
      .filter((lead) => lead.phone)
      .sort((a, b) => {
        const dateA = parseISO(a.nextFollowUp);
        const dateB = parseISO(b.nextFollowUp);
        return dateA.getTime() - dateB.getTime();
      });
  }, [currentUser, getLeadsForUser]);

  useEffect(() => {
    if (!selectedLead && queue.length > 0) {
      selectLead(queue[0]);
    }
  }, [queue, selectLead, selectedLead]);

  const handleToast = (message: string) => {
    toast.success(`📞 ${message}`);
  };

  const handleLogCall = () => {
    if (!selectedLead) return;
    handleToast(`Call logged for ${selectedLead.name}`);
    const currentIndex = queue.findIndex((lead) => lead.id === selectedLead.id);
    const nextLead = queue[currentIndex + 1];
    if (nextLead) {
      selectLead(nextLead);
      setNotes("");
      setOutcome(outcomes[0]);
    }
  };

  return (
    <div className="flex h-full flex-col gap-6 lg:flex-row">
      <div className="flex w-full flex-col border-zinc-800 lg:w-[35%] lg:border-r">
        <div className="flex items-center justify-between px-4 pt-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Call Queue
          </p>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
            {queue.length}
          </span>
        </div>
        <div className="custom-scrollbar mt-4 flex-1 overflow-y-auto">
          {queue.map((lead) => {
            const isSelected = selectedLead?.id === lead.id;
            const dueInDays = differenceInDays(
              parseISO(lead.nextFollowUp),
              new Date()
            );
            let badge = "Due today";
            let badgeClass = "bg-amber-500/10 text-amber-400";
            if (dueInDays < 0) {
              badge = `Overdue by ${Math.abs(dueInDays)} days`;
              badgeClass = "bg-red-500/10 text-red-400";
            } else if (dueInDays > 0) {
              badge = `In ${dueInDays} days`;
              badgeClass = "bg-green-500/10 text-green-400";
            }

            return (
              <button
                key={lead.id}
                type="button"
                onClick={() => selectLead(lead)}
                className={cn(
                  "flex w-full flex-col gap-1 border-b border-zinc-800 px-4 py-3 text-left transition hover:bg-zinc-800/50",
                  isSelected && "bg-indigo-500/10"
                )}
              >
                <p className="text-sm font-medium text-white">{lead.name}</p>
                <p className="text-xs text-zinc-400">{lead.company}</p>
                <p className="text-xs text-zinc-500">{lead.phone}</p>
                <span className={`mt-1 w-fit rounded-full px-2 py-0.5 text-xs ${badgeClass}`}>
                  {badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full px-6 py-4 lg:w-[65%]">
        {!selectedLead ? (
          <p className="text-sm text-zinc-500">Select a lead to begin calling.</p>
        ) : (
          <>
            <div className="rounded-xl bg-zinc-800/50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-white">
                    {selectedLead.name}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {selectedLead.title} · {selectedLead.company}
                  </p>
                  <p className="mt-2 text-base text-indigo-400">
                    {selectedLead.phone}
                  </p>
                </div>
                <div className="text-right text-sm text-zinc-400">
                  <div className="flex items-center justify-end gap-2">
                    <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-xs text-zinc-200">
                      {selectedLead.stage}
                    </span>
                    <span className="text-xs text-zinc-500">
                      Score {selectedLead.score}
                    </span>
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        selectedLead.temperature === "hot"
                          ? "bg-red-400"
                          : selectedLead.temperature === "warm"
                          ? "bg-amber-400"
                          : "bg-blue-400"
                      )}
                    />
                  </div>
                  <p className="mt-2">
                    Deal value: ${selectedLead.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-400" />
                <p className="text-base font-semibold text-white">AI Call Script</p>
              </div>
              <p className="mt-3 text-sm text-zinc-300">
                Hi {selectedLead.name.split(" ")[0]}, this is {currentUser?.name}{" "}
                from LeadPilot. I'm reaching out because your team is focused on
                improving {selectedLead.stage} outcomes.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />
                  Reference their interest in faster follow-ups.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />
                  Mention a case study from a similar company.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />
                  Propose a demo timeline for next week.
                </li>
              </ul>
              <details className="mt-4 text-sm text-zinc-300">
                <summary className="cursor-pointer text-zinc-400">
                  Objection handling
                </summary>
                <div className="mt-2 space-y-2 text-xs text-zinc-400">
                  <p>Too expensive → Offer ROI calculator.</p>
                  <p>Need to think about it → Offer limited-time pilot.</p>
                  <p>Using competitor → Highlight differentiators.</p>
                </div>
              </details>
              <div className="mt-4 text-sm text-red-400">
                <p>Don't mention pricing until they confirm budget range.</p>
                <p>Avoid technical jargon — they're a business buyer.</p>
              </div>
            </div>

            <div className="mt-5">
              <label className="text-sm font-semibold text-zinc-400">
                Call Notes
              </label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Type your call notes here..."
                className="mt-2 min-h-[120px] w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-sm text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <select
                value={outcome}
                onChange={(event) => setOutcome(event.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300"
              >
                {outcomes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleLogCall}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm text-white"
              >
                Log Call
              </button>
              <p className="text-xs text-zinc-500">
                Last activity{" "}
                {formatDistanceToNow(new Date(selectedLead.lastActivityAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="sr-only" aria-live="polite" />
    </div>
  );
}
