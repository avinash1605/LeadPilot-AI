"use client";

import type { Agent } from "@/lib/types";
import { AgentCard } from "@/components/agents/agent-card";

interface AgentGridProps {
  agents: Agent[];
  isAdmin: boolean;
  onToggle: (agentId: string) => void;
  onOpen: (agent: Agent) => void;
}

export function AgentGrid({ agents, isAdmin, onToggle, onOpen }: AgentGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {agents.map((agent, index) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          index={index}
          isAdmin={isAdmin}
          onToggle={onToggle}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
