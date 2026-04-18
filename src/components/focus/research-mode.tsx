"use client";

import { useMemo, useState } from "react";
import { Link2, Search, Sparkles, Zap } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useLeadStore } from "@/lib/store/lead-store";
import { cn } from "@/lib/utils";

export function ResearchMode() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const { getLeadsForUser } = useLeadStore();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const leads = useMemo(() => {
    if (!currentUser) return [];
    const assigned = getLeadsForUser(currentUser.id);
    if (!query.trim()) return assigned;
    const term = query.toLowerCase();
    return assigned.filter(
      (lead) =>
        lead.name.toLowerCase().includes(term) ||
        lead.company.toLowerCase().includes(term)
    );
  }, [currentUser, getLeadsForUser, query]);

  const selectedLead = leads.find((lead) => lead.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3">
          <Search className="text-zinc-500" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for a lead or company to research..."
            className="w-full bg-transparent text-base text-white placeholder:text-zinc-500 focus:outline-none"
          />
        </div>
      </div>

      {!selectedLead ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {leads.map((lead) => {
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
                onClick={() => setSelectedId(lead.id)}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20"
              >
                <p className="text-sm font-medium text-white">{lead.name}</p>
                <p className="text-xs text-zinc-400">{lead.company}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
                  <span className={`h-2 w-2 rounded-full ${tempColor}`} />
                  <span className={cn(lead.score > 80 && "score-pulse")}>
                    Score {lead.score}
                  </span>
                </div>
                <span className="mt-3 inline-flex text-xs text-indigo-400">
                  Research →
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="text-sm text-indigo-400"
          >
            ← Back to all leads
          </button>

          <div className="rounded-xl bg-zinc-800/50 p-5">
            <h2 className="text-xl font-semibold text-white">
              {selectedLead.company}
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                ["Industry", "SaaS"],
                ["Company Size", "200-500 employees"],
                ["Founded", "2019"],
                ["Headquarters", "Bengaluru, India"],
                ["Website", "www.example.com"],
                ["Revenue Range", "$10M - $25M"],
              ].map(([label, value]) => (
                <div key={label} className="text-sm text-zinc-400">
                  {label}
                  <p className="text-zinc-200">{value}</p>
                </div>
              ))}
              <div className="text-sm text-zinc-400">
                Tech Stack
                <p className="text-zinc-200">React, AWS, Salesforce, Slack</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <h3 className="text-sm font-semibold text-white">Key Contacts</h3>
            <div className="mt-4 space-y-3">
              {[
                ["Ravi Kumar", "VP of Engineering"],
                ["Sneha Iyer", "Head of Procurement"],
                ["Daniel Cho", "Revenue Operations"],
              ].map(([name, title]) => (
                <div key={name} className="flex items-center gap-3 text-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/10 text-xs text-indigo-300">
                    {name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white">{name}</p>
                    <p className="text-xs text-zinc-400">{title}</p>
                  </div>
                  <Link2 size={16} className="text-zinc-500" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Company News</h3>
            <div className="mt-3 space-y-3">
              {[
                `${selectedLead.company} expands operations to Southeast Asia`,
                `${selectedLead.company} launches new AI product suite`,
              ].map((headline) => (
                <div key={headline} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-sm font-medium text-white">{headline}</p>
                  <p className="text-xs text-zinc-500">
                    TechCrunch · 2 weeks ago
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Zap size={16} />
              Competitive Intelligence
            </div>
            <p className="mt-2 text-sm text-zinc-300">
              Currently using: LeadOpsX. Contract status: Expires Q2 2026.
              Satisfaction level: Medium — mentioned pain points around scalability.
            </p>
          </div>

          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles size={16} />
              AI Research Summary
            </div>
            <p className="mt-2 text-sm text-zinc-300">
              Based on analysis, {selectedLead.company} is in growth mode. They
              recently expanded their engineering team by 40% and are actively
              evaluating new tooling. High intent signals detected — recommend
              positioning around scalability and integration capabilities.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
