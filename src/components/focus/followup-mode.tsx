"use client";

import { useMemo, useState } from "react";
import { CheckCircle, Clock, FileText, Mail, Phone } from "lucide-react";
import { differenceInDays, isBefore, isToday, parseISO } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { useLeadStore } from "@/lib/store/lead-store";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const actionPool = [
  { label: "Send Email", icon: Mail, color: "indigo" },
  { label: "Make Call", icon: Phone, color: "emerald" },
  { label: "Send Proposal", icon: FileText, color: "violet" },
];

export function FollowUpMode() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.currentUser);
  const { getLeadsForUser } = useLeadStore();

  const leads = useMemo(() => {
    if (!currentUser) return [];
    return getLeadsForUser(currentUser.id);
  }, [currentUser, getLeadsForUser]);

  const overdue = leads.filter((lead) =>
    isBefore(parseISO(lead.nextFollowUp), new Date())
  );
  const dueToday = leads.filter((lead) =>
    isToday(parseISO(lead.nextFollowUp))
  );
  const upcoming = leads.filter((lead) => {
    const date = parseISO(lead.nextFollowUp);
    return differenceInDays(date, new Date()) > 0 && differenceInDays(date, new Date()) <= 3;
  });

  const completed = 8;
  const total = 18;
  const progress = Math.round((completed / total) * 100);

  const nothingDue =
    overdue.length === 0 && dueToday.length === 0 && upcoming.length === 0;

  const handleToast = (message: string) => {
    toast.info(message);
  };

  const renderItem = (lead: typeof leads[number], status: "overdue" | "today" | "upcoming") => {
    const action = actionPool[lead.score % actionPool.length];
    const ActionIcon = action.icon;
    const dueText =
      status === "overdue"
        ? `Overdue by ${Math.abs(differenceInDays(parseISO(lead.nextFollowUp), new Date()))} days`
        : status === "today"
        ? "Due today"
        : `In ${differenceInDays(parseISO(lead.nextFollowUp), new Date())} days`;

    const dueColor =
      status === "overdue"
        ? "text-red-400"
        : status === "today"
        ? "text-amber-400"
        : "text-green-400";

    return (
      <div
        key={lead.id}
        className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/50 py-3 last:border-b-0"
      >
        <div>
          <p className="text-sm font-medium text-white">{lead.name}</p>
          <p className="text-xs text-zinc-400">{lead.company}</p>
        </div>
        <div className="text-xs text-zinc-500">
          <p className={dueColor}>{dueText}</p>
          <p>Last: Email opened 4 days ago</p>
        </div>
        <span
          className={cn(
            "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs",
            action.color === "indigo" && "bg-indigo-500/10 text-indigo-400",
            action.color === "emerald" && "bg-emerald-500/10 text-emerald-400",
            action.color === "violet" && "bg-violet-500/10 text-violet-400"
          )}
        >
          <ActionIcon size={14} />
          {action.label}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/user/focus/lead-emailing")}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-indigo-500/20"
          >
            <Mail size={14} />
          </button>
          <button
            type="button"
            onClick={() => router.push("/user/focus/lead-calling")}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-emerald-500/20"
          >
            <Phone size={14} />
          </button>
          <button
            type="button"
            onClick={() => handleToast("Snoozed for 1 day")}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          >
            <Clock size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-zinc-400">
          {completed} of {total} follow-ups completed today
        </p>
        <div className="mt-2 h-3 rounded-full bg-zinc-800">
          <div
            className="h-3 rounded-full bg-indigo-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {nothingDue ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8">
          <EmptyState
            icon={CheckCircle}
            title="All caught up!"
            description="No follow-ups pending. Great work! 🎉"
          />
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-center justify-between text-red-400">
              <p className="text-base font-semibold">Overdue</p>
              <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs">
                {overdue.length}
              </span>
            </div>
            <div className="mt-3 space-y-1">
              {overdue.map((lead) => renderItem(lead, "overdue"))}
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-center justify-between text-amber-400">
              <p className="text-base font-semibold">Due Today</p>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs">
                {dueToday.length}
              </span>
            </div>
            <div className="mt-3 space-y-1">
              {dueToday.map((lead) => renderItem(lead, "today"))}
            </div>
          </div>

          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <div className="flex items-center justify-between text-green-400">
              <p className="text-base font-semibold">Upcoming (Next 3 Days)</p>
              <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs">
                {upcoming.length}
              </span>
            </div>
            <div className="mt-3 space-y-1">
              {upcoming.map((lead) => renderItem(lead, "upcoming"))}
            </div>
          </div>
        </>
      )}

      <div className="sr-only" aria-live="polite" />
    </div>
  );
}
