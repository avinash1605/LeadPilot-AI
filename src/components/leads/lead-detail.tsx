"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { Lead } from "@/lib/types";
import { users } from "@/lib/mock-data/users";
import { cn } from "@/lib/utils";

const stages: Array<Lead["stage"]> = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "won",
];

const stageLabels: Record<Lead["stage"], string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
  cold: "Cold",
};

interface LeadDetailProps {
  lead: Lead | null;
  onClose: () => void;
}

export function LeadDetail({ lead, onClose }: LeadDetailProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [notes, setNotes] = useState<string[]>([]);
  const [noteText, setNoteText] = useState("");
  const [expandedEmail, setExpandedEmail] = useState<number | null>(null);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener("leadpilot:close-overlays", handler);
    return () => window.removeEventListener("leadpilot:close-overlays", handler);
  }, [onClose]);

  useEffect(() => {
    panelRef.current?.focus();
  }, [lead?.id]);

  useEffect(() => {
    setNotes([
      "Initial call went well. They're interested in the enterprise plan. Decision maker is the VP of Engineering.",
      "Sent case study for their industry. They asked about API integrations.",
      "Budget approved for Q2. Moving to proposal stage.",
    ]);
  }, [lead?.id]);

  const assignee = users.find((user) => user.id === lead?.assignedTo);

  const activities = useMemo(() => {
    if (!lead) return [];
    const base = [
      { text: `Added from ${lead.source} campaign`, color: "bg-zinc-600" },
      { text: `Assigned to ${assignee?.name ?? "rep"}`, color: "bg-zinc-600" },
      {
        text: `Classified by AI — Score: ${lead.score}, ${lead.temperature}`,
        color: "bg-indigo-500",
      },
      { text: "Email sent: Introduction to LeadPilot", color: "bg-green-500" },
      { text: "Email opened", color: "bg-green-400" },
      { text: "Call made — 5 min, Connected", color: "bg-blue-500" },
      { text: `Moved to ${lead.stage} stage`, color: "bg-purple-500" },
    ];
    if (lead.riskFlag) {
      base.push({
        text: `Risk flagged: ${lead.riskReason}`,
        color: "bg-red-500",
      });
    }
    base.push({
      text: `Follow-up scheduled for ${lead.nextFollowUp}`,
      color: "bg-amber-500",
    });
    return base.map((item, index) => ({
      ...item,
      time: formatDistanceToNow(new Date(lead.lastActivityAt), {
        addSuffix: true,
      }),
      id: `${lead.id}-${index}`,
    }));
  }, [assignee?.name, lead]);

  const emails = useMemo(() => {
    if (!lead) return [];
    return [
      {
        subject: "Introduction to LeadPilot",
        status: "Opened",
        date: "5 days ago",
        body: `Hi ${lead.name},\n\nThanks for taking the time to explore LeadPilot. I'd love to walk through a tailored workflow for ${lead.company}.`,
      },
      {
        subject: "Following Up — ROI Calculator",
        status: "Sent",
        date: "3 days ago",
        body: `Hi ${lead.name},\n\nSharing the ROI calculator we discussed. Let me know if you'd like help customizing it for ${lead.company}.`,
      },
      {
        subject: `Quick Question About ${lead.company}`,
        status: "Draft",
        date: "Today",
        body: `Hi ${lead.name},\n\nJust checking in with a quick question about your priorities for ${lead.company} this quarter.`,
      },
    ];
  }, [lead]);

  if (!lead) return null;

  const winProbability = Math.round(lead.predictedWinProbability * 100);
  const winColor =
    winProbability > 70
      ? "stroke-green-500"
      : winProbability > 40
      ? "stroke-amber-500"
      : "stroke-red-500";

  const handleToast = (message: string, type: "success" | "info" = "info") => {
    if (type === "success") {
      toast.success(message);
      return;
    }
    toast.info(message);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ x: 520, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 520, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative w-[520px] max-w-[90vw] border-l border-zinc-800 bg-zinc-900"
          tabIndex={-1}
          ref={panelRef}
        >
          <div className="border-b border-zinc-800 p-6">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 text-zinc-400"
            >
              <X size={18} />
            </button>
            <h2 className="text-xl font-semibold text-white">{lead.name}</h2>
            <p className="text-sm text-zinc-400">{lead.company}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span
                className={cn(
                  "rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-300",
                  lead.score > 80 && "score-pulse"
                )}
              >
                Score {lead.score}
              </span>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-300">
                {lead.temperature}
              </span>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-zinc-300">
                {lead.stage}
              </span>
              {lead.riskFlag ? (
                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-red-400">
                  Risk
                </span>
              ) : null}
            </div>
          </div>

          <div className="border-b border-zinc-800">
            {["overview", "activity", "emails", "notes"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-3 text-sm capitalize",
                  activeTab === tab
                    ? "border-b-2 border-indigo-500 text-indigo-400"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="custom-scrollbar h-[calc(100vh-220px)] overflow-y-auto p-6">
            {activeTab === "overview" ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm text-zinc-200">
                  {[
                    ["Full Name", lead.name],
                    ["Title", lead.title],
                    ["Email", lead.email],
                    ["Phone", lead.phone],
                    ["Company", lead.company],
                    ["Source", lead.source],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs uppercase text-zinc-500">{label}</p>
                      <p className={label === "Email" ? "text-indigo-400" : ""}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs uppercase text-zinc-500">Stage Progress</p>
                  <div className="mt-3 flex items-center gap-2">
                    {stages.map((stage, index) => {
                      const isActive = stages.indexOf(lead.stage) >= index;
                      return (
                        <div key={stage} className="flex flex-col items-center">
                          <span
                            className={cn(
                              "h-2.5 w-2.5 rounded-full",
                              isActive ? "bg-indigo-500" : "bg-zinc-700",
                              stage === lead.stage && "animate-pulse"
                            )}
                          />
                          <span className="mt-1 text-[10px] text-zinc-500">
                            {stageLabels[stage]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-800/40 p-4">
                    <p className="text-xs uppercase text-zinc-500">Emails</p>
                    <p className="mt-2 text-sm text-zinc-200">
                      {lead.emailsSent} sent / {lead.emailsOpened} opened /{" "}
                      {lead.emailsReplied} replied
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-800/40 p-4">
                    <p className="text-xs uppercase text-zinc-500">Calls</p>
                    <p className="mt-2 text-sm text-zinc-200">
                      {lead.callsMade} calls, {lead.callsDuration} min total
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-800/40 p-4">
                    <p className="text-xs uppercase text-zinc-500">Deal Value</p>
                    <p className="mt-2 text-lg text-white">
                      ${lead.value.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-800/40 p-4">
                    <p className="text-xs uppercase text-zinc-500">Win Probability</p>
                    <div className="mt-2 flex items-center gap-3">
                      <svg width="60" height="60">
                        <circle
                          cx="30"
                          cy="30"
                          r="24"
                          fill="none"
                          stroke="#27272a"
                          strokeWidth="4"
                        />
                        <circle
                          cx="30"
                          cy="30"
                          r="24"
                          fill="none"
                          strokeWidth="4"
                          strokeDasharray={`${(winProbability / 100) * 150} 150`}
                          className={winColor}
                        />
                      </svg>
                      <span className="text-lg font-bold text-white">
                        {winProbability}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase text-zinc-500">Tags</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {lead.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300"
                      >
                        {tag}
                        <button onClick={() => handleToast("Tag removed")} type="button">
                          ×
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleToast("Tag added")}
                      className="rounded-full border border-dashed border-zinc-700 px-2.5 py-1 text-xs text-zinc-500"
                    >
                      + Add tag
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase text-zinc-500">Assigned To</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs text-white">
                      {assignee?.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </div>
                    <span className="text-sm text-zinc-200">{assignee?.name}</span>
                    <button
                      type="button"
                      onClick={() => handleToast("Reassigned to Ananya Singh")}
                      className="ml-auto rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-400"
                    >
                      Reassign
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === "activity" ? (
              <div className="relative space-y-4">
                <div className="absolute left-2 top-0 h-full w-0.5 bg-zinc-800" />
                {activities.map((activity) => (
                  <div key={activity.id} className="relative flex items-start gap-3">
                    <span className={`mt-1 h-3 w-3 rounded-full ${activity.color}`} />
                    <div className="rounded-xl bg-zinc-800/40 p-3 text-sm text-zinc-300">
                      <p>{activity.text}</p>
                      <p className="mt-1 text-xs text-zinc-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {activeTab === "emails" ? (
              <div className="space-y-3">
                {emails.map((email, index) => (
                  <motion.div
                    key={email.subject}
                    layout
                    className="rounded-xl bg-zinc-800/50 p-4"
                    onClick={() =>
                      setExpandedEmail(expandedEmail === index ? null : index)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white">{email.subject}</p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs",
                          email.status === "Sent" && "bg-green-500/10 text-green-500",
                          email.status === "Opened" && "bg-blue-500/10 text-blue-400",
                          email.status === "Draft" && "bg-zinc-700 text-zinc-400"
                        )}
                      >
                        {email.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">{email.date}</p>
                    <p className="mt-2 text-xs text-zinc-400">
                      {expandedEmail === index ? email.body : `${email.body.slice(0, 80)}...`}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : null}

            {activeTab === "notes" ? (
              <div>
                <textarea
                  value={noteText}
                  onChange={(event) => setNoteText(event.target.value)}
                  placeholder="Add a note..."
                  className="min-h-[80px] w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-sm text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!noteText.trim()) return;
                    setNotes((prev) => [noteText, ...prev]);
                    setNoteText("");
                    handleToast("Note saved", "success");
                  }}
                  className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"
                >
                  Save Note
                </button>
                <div className="mt-4 space-y-3">
                  {notes.map((note, index) => (
                    <div key={`${note}-${index}`} className="rounded-lg bg-zinc-800/30 p-3">
                      <p className="text-sm text-zinc-300">{note}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {index % 2 === 0 ? "Rahul" : "Ananya"} ·{" "}
                        {formatDistanceToNow(new Date(lead.lastActivityAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="sr-only" aria-live="polite" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
