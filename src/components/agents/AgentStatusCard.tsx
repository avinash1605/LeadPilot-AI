interface AgentStatusCardProps {
  name: string;
  status: "active" | "idle";
}

export function AgentStatusCard({ name, status }: AgentStatusCardProps) {
  const isActive = status === "active";

  return (
    <div className="card-glow flex items-center justify-between p-4">
      <div>
        <p className="text-sm text-text-secondary">Agent</p>
        <p className="font-heading text-base text-text-primary">{name}</p>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          isActive ? "bg-accent/20 text-accent" : "bg-surface text-text-secondary"
        }`}
      >
        {isActive ? "Active" : "Idle"}
      </span>
    </div>
  );
}
