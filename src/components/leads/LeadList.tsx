interface LeadListProps {
  leads: Array<{ id: string; name: string; status: string }>;
}

export function LeadList({ leads }: LeadListProps) {
  return (
    <div className="card-glow p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-lg text-text-primary">Recent leads</h3>
        <span className="text-xs text-text-secondary">{leads.length} total</span>
      </div>
      <ul className="space-y-3 text-sm text-text-secondary">
        {leads.map((lead) => (
          <li key={lead.id} className="flex items-center justify-between">
            <span className="text-text-primary">{lead.name}</span>
            <span className="rounded-full border border-border px-2 py-1 text-xs">
              {lead.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
