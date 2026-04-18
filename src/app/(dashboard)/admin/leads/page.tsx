"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LeadsToolbar } from "@/components/leads/leads-toolbar";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadDetail } from "@/components/leads/lead-detail";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoadingDelay } from "@/hooks/useLoadingDelay";
import { useLeadStore } from "@/lib/store/lead-store";

export default function AdminLeadsPage() {
  const { filteredLeads } = useLeadStore();
  const [sort, setSort] = useState("score-desc");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const isLoading = useLoadingDelay(700);
  const selectedLead = filteredLeads.find((lead) => lead.id === selectedLeadId) ?? null;

  const sortedLeads = useMemo(() => {
    const leads = [...filteredLeads];
    switch (sort) {
      case "score-asc":
        return leads.sort((a, b) => a.score - b.score);
      case "recent":
        return leads.sort(
          (a, b) =>
            new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
        );
      case "value-desc":
        return leads.sort((a, b) => b.value - a.value);
      case "created-desc":
        return leads.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "name-asc":
        return leads.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return leads.sort((a, b) => b.score - a.score);
    }
  }, [filteredLeads, sort]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Leads</h1>
        <span className="text-sm text-zinc-500">
          Showing {sortedLeads.length} of 524 leads
        </span>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="leads-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Skeleton className="h-[64px] w-full" />
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="mb-3 h-[32px] w-full last:mb-0"
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="leads-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <LeadsToolbar sort={sort} onSortChange={setSort} />

            <LeadsTable
              leads={sortedLeads}
              onSelectLead={(lead) => setSelectedLeadId(lead.id)}
              selectedLeadId={selectedLeadId}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {selectedLead ? (
        <LeadDetail lead={selectedLead} onClose={() => setSelectedLeadId(null)} />
      ) : null}
    </div>
  );
}
