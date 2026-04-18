"use client";

import { useMemo, useState } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useLeadStore } from "@/lib/store/lead-store";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadDetail } from "@/components/leads/lead-detail";

export default function UserLeadsPage() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const { getLeadsForUser } = useLeadStore();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const leads = useMemo(() => {
    if (!currentUser) return [];
    return getLeadsForUser(currentUser.id);
  }, [currentUser, getLeadsForUser]);

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Leads</h1>
        <p className="text-sm text-zinc-400">Your assigned pipeline accounts.</p>
      </div>
      <LeadsTable
        leads={leads}
        onSelectLead={(lead) => setSelectedLeadId(lead.id)}
        selectedLeadId={selectedLeadId}
      />
      {selectedLead ? (
        <LeadDetail lead={selectedLead} onClose={() => setSelectedLeadId(null)} />
      ) : null}
    </div>
  );
}
