"use client";

import { motion } from "framer-motion";
import { teamPerformance } from "@/lib/mock-data/metrics";

export function TeamPerformance() {
  const sorted = [...teamPerformance].sort(
    (a, b) => b.conversionRate - a.conversionRate
  );
  const maxLeads = Math.max(...sorted.map((entry) => entry.leads));
  const maxConversions = Math.max(...sorted.map((entry) => entry.conversions));

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Team Performance</h2>
        <span className="text-sm text-zinc-500">This month</span>
      </div>
      <div className="mt-5 space-y-4">
        {sorted.map((member, index) => {
          const initials = member.name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2);
          const leadsWidth = (member.leads / maxLeads) * 100;
          const conversionsWidth =
            (member.conversions / maxConversions) * 100;

          return (
            <div
              key={member.name}
              className="rounded-lg p-3 transition hover:bg-zinc-800/60"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-200">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm text-white">{member.name}</p>
                    <p className="text-xs text-zinc-500">
                      {member.leads} leads · {member.conversions} conversions
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-white">
                  {member.conversionRate}%
                </span>
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-2 rounded-full bg-zinc-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${leadsWidth}%` }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="h-2 rounded-full bg-indigo-500"
                  />
                </div>
                <div className="h-2 rounded-full bg-zinc-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${conversionsWidth}%` }}
                    transition={{ duration: 0.6, delay: index * 0.12 }}
                    className="h-2 rounded-full bg-green-500"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
