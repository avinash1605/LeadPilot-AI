"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Mail, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/auth-store";
import { useLeadStore } from "@/lib/store/lead-store";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

const toneOptions = ["Professional", "Friendly", "Urgent"] as const;
type Tone = (typeof toneOptions)[number];

const subjectTemplates: Record<Tone, string> = {
  Professional: "Following Up on Our Discussion",
  Friendly: "Great Connecting with You, {{firstName}}!",
  Urgent: "Time-Sensitive: Next Steps for {{company}}",
};

const emailTemplates: Record<Tone, string[]> = {
  Professional: [
    `Hi {{firstName}},\n\nI hope you're doing well. I wanted to follow up on our recent discussion about {{company}}'s goals and share a few ways LeadPilot can help streamline your pipeline.\n\nBased on your focus on {{title}}, we've outlined a plan that improves lead response times and surfaces the highest-intent opportunities. If it helps, I can share a quick summary deck and a proposed rollout timeline.\n\nWould next Tuesday or Wednesday work for a brief 15-minute call?\n\nBest regards,\n{{userName}}`,
    `Hi {{firstName}},\n\nThanks again for your time earlier. After reviewing your team's priorities at {{company}}, I believe we can deliver immediate wins around lead scoring and follow-up automation.\n\nIf you're open to it, I can walk you through a tailored plan and a few customer examples. Let me know a time this week that works best.\n\nRegards,\n{{userName}}`,
  ],
  Friendly: [
    `Hi {{firstName}},\n\nGreat chatting with you! I’ve been thinking about {{company}} and how LeadPilot could make your day-to-day a lot easier, especially with {{title}}.\n\nIf you're up for it, I'd love to share a few ideas and see if we can line up a quick call this week.\n\nCheers,\n{{userName}}`,
    `Hey {{firstName}},\n\nHope you’re having a good week! I put together a few quick notes on how LeadPilot can help {{company}} stay on top of follow-ups and hot leads.\n\nWant to take a look together? Happy to hop on a short call whenever it’s convenient.\n\nThanks,\n{{userName}}`,
  ],
  Urgent: [
    `Hi {{firstName}},\n\nI wanted to follow up quickly because {{company}} has a real opportunity to improve pipeline velocity this quarter. We can help you eliminate manual follow-ups and surface high-intent leads faster.\n\nI have a few openings tomorrow to walk you through next steps—can we lock in 15 minutes?\n\nBest,\n{{userName}}`,
    `Hi {{firstName}},\n\nTime-sensitive note: we're seeing teams like {{company}} gain immediate wins by automating outreach. If you can spare 10–15 minutes this week, I can show you the exact workflow.\n\nDoes today or tomorrow work on your end?\n\nThanks,\n{{userName}}`,
  ],
};

const industryOptions = ["SaaS", "FinTech", "E-commerce", "HealthTech", "AI"];
const sizeOptions = ["50-200 employees", "200-500 employees", "500-1000 employees"];
const locationOptions = [
  "Mumbai, India",
  "San Francisco, USA",
  "London, UK",
  "Bengaluru, India",
  "Singapore",
];

export function EmailMode() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const { getLeadsForUser, selectLead, selectedLead } = useLeadStore();
  const [search, setSearch] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");
  const [templateIndex, setTemplateIndex] = useState(0);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleValue, setScheduleValue] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [subject, setSubject] = useState(subjectTemplates.Professional);
  const [body, setBody] = useState(emailTemplates.Professional[0]);

  const leads = useMemo(() => {
    if (!currentUser) return [];
    return getLeadsForUser(currentUser.id)
      .filter((lead) => {
        const term = search.toLowerCase();
        if (!term) return true;
        return (
          lead.name.toLowerCase().includes(term) ||
          lead.company.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => b.score - a.score);
  }, [currentUser, getLeadsForUser, search]);

  useEffect(() => {
    if (!selectedLead && leads.length > 0) {
      selectLead(leads[0]);
    }
  }, [leads, selectLead, selectedLead]);

  const selected = selectedLead;
  useEffect(() => {
    const subjectTemplate = subjectTemplates[tone];
    const nextSubject = selected
      ? subjectTemplate
          .replace("{{firstName}}", selected.name.split(" ")[0])
          .replace("{{company}}", selected.company)
      : subjectTemplate;

    const bodyTemplate = emailTemplates[tone][templateIndex % 2];
    const nextBody = selected
      ? bodyTemplate
          .replace("{{firstName}}", selected.name.split(" ")[0])
          .replace("{{company}}", selected.company)
          .replace("{{title}}", selected.title)
          .replace("{{userName}}", currentUser?.name ?? "LeadPilot Rep")
      : bodyTemplate;

    setSubject(nextSubject);
    setBody(nextBody);
  }, [currentUser?.name, selected, templateIndex, tone]);

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setTemplateIndex((index) => index + 1);
      setIsRegenerating(false);
    }, 700);
  };

  const handleToast = (message: string) => {
    toast.info(message);
  };

  const companyInfo = selected
    ? {
        industry:
          industryOptions[selected.name.length % industryOptions.length],
        size: sizeOptions[selected.company.length % sizeOptions.length],
        founded: 2017 + (selected.score % 6),
        location:
          locationOptions[selected.email.length % locationOptions.length],
      }
    : null;

  const activity = [
    "Email opened",
    "Link clicked",
    "Call — 5 min",
    "Added from LinkedIn",
    "Follow-up scheduled",
  ];

  return (
    <div className="flex h-full flex-col gap-6 lg:flex-row">
      <div className="flex w-full flex-col border-zinc-800 lg:w-[30%] lg:border-r">
        <div className="px-4 pt-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Lead Queue
          </p>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search leads..."
            className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500"
          />
        </div>
        <div className="custom-scrollbar mt-4 flex-1 overflow-y-auto">
          {leads.length === 0 ? (
            <div className="px-4 py-8">
              <EmptyState
                icon={Users}
                title="No leads assigned"
                description="Contact your admin to get leads assigned"
              />
            </div>
          ) : (
            leads.map((lead) => {
              const isSelected = selected?.id === lead.id;
              const scoreClass =
                lead.score > 70
                  ? "bg-green-500/10 text-green-500"
                  : lead.score >= 40
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-red-500/10 text-red-500";
              const tempColor =
                lead.temperature === "hot"
                  ? "bg-red-400"
                  : lead.temperature === "warm"
                  ? "bg-amber-400"
                  : "bg-blue-400";
              return (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => selectLead(lead)}
                  className={cn(
                    "flex w-full items-center justify-between border-b border-zinc-800 px-4 py-3 text-left transition hover:bg-zinc-800/50",
                    isSelected && "border-l-2 border-indigo-500 bg-indigo-500/10"
                  )}
                >
                  <div>
                    <p className="text-sm font-medium text-white">{lead.name}</p>
                    <p className="text-xs text-zinc-400">{lead.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${tempColor}`} />
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        scoreClass,
                        lead.score > 80 && "score-pulse"
                      )}
                    >
                      {lead.score}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex w-full flex-col px-6 py-4 lg:w-[45%]">
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Mail className="h-12 w-12 text-zinc-700" />
            <p className="mt-3 text-sm text-zinc-500">
              Select a lead to compose an email
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium text-white">
                    {selected.name} · {selected.company}
                  </p>
                  <p className="text-sm text-zinc-400">{selected.title}</p>
                </div>
                <p className="text-xs text-zinc-500">
                  Last interaction:{" "}
                  {formatDistanceToNow(new Date(selected.lastActivityAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {toneOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTone(option)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm transition",
                    tone === option
                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                      : "border-zinc-700 bg-zinc-800 text-zinc-400"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="text-sm text-zinc-400">Subject</label>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="mt-3">
              <label className="text-sm text-zinc-400">Email Body</label>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                className={cn(
                  "mt-2 min-h-[250px] w-full rounded-xl border border-zinc-700 bg-zinc-800 p-4 text-sm leading-relaxed text-zinc-100",
                  isRegenerating && "animate-pulse"
                )}
              />
            </div>

            <button
              type="button"
              onClick={handleRegenerate}
              className="mt-3 inline-flex w-fit items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-sm text-indigo-400"
            >
              <Sparkles size={14} />
              Regenerate with AI
            </button>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => toast.success(`✅ Email sent to ${selected.name}`)}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm text-white transition hover:bg-indigo-500"
              >
                Send Now
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSchedule((prev) => !prev)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm text-zinc-300"
                >
                  Schedule Send
                </button>
                {showSchedule ? (
                  <div className="absolute top-12 z-10 w-56 rounded-xl border border-zinc-700 bg-zinc-900 p-3 shadow-xl">
                    <input
                      type="datetime-local"
                      value={scheduleValue}
                      onChange={(event) => setScheduleValue(event.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowSchedule(false);
                        toast.success("Schedule confirmed");
                      }}
                      className="mt-2 w-full rounded-lg bg-indigo-600 px-2 py-1 text-xs text-white"
                    >
                      Confirm
                    </button>
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => toast.info("Draft saved")}
                className="rounded-xl bg-zinc-800 px-4 py-2.5 text-sm text-zinc-400"
              >
                Save Draft
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex w-full flex-col border-zinc-800 px-4 py-4 lg:w-[25%] lg:border-l">
        {!selected ? (
          <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
            Select a lead to view intel.
          </div>
        ) : (
          <>
            <div className="rounded-xl bg-zinc-800/50 p-4">
              <p className="text-base font-medium text-white">
                {selected.company}
              </p>
              <div className="mt-3 space-y-2 text-sm text-zinc-300">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  Industry <span className="text-zinc-300">{companyInfo?.industry}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  Size <span className="text-zinc-300">{companyInfo?.size}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  Founded <span className="text-zinc-300">{companyInfo?.founded}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  Location <span className="text-zinc-300">{companyInfo?.location}</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-zinc-400">Activity</p>
              <div className="mt-3 space-y-3">
                {activity.map((item, index) => (
                  <div key={item} className="flex items-start gap-2 text-xs text-zinc-400">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    <div>
                      <p className="text-zinc-300">{item}</p>
                      <p className="text-zinc-500">{index + 1} days ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
                <Sparkles size={14} />
                AI Insight
              </div>
              <p className="mt-2 text-sm text-zinc-300">
                This lead has {Math.round(selected.predictedWinProbability * 100)}%
                win probability. They responded well to case study emails.
                Recommend sending the ROI calculator next.
              </p>
            </div>

            {selected.riskFlag ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-300">
                <AlertTriangle size={16} className="mt-0.5" />
                <span>{selected.riskReason}</span>
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="sr-only" aria-live="polite" />
    </div>
  );
}
