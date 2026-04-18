"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAgentSimulation } from "@/hooks/useAgentSimulation";
import { AgentGrid } from "@/components/agents/agent-grid";
import { AgentDetailModal } from "@/components/agents/agent-detail-modal";
import { ActivityStream } from "@/components/agents/activity-stream";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoadingDelay } from "@/hooks/useLoadingDelay";
import { useAgentStore } from "@/lib/store/agent-store";
import type { Agent } from "@/lib/types";

export default function UserAgentsPage() {
  useAgentSimulation(true);
  const agents = useAgentStore((state) => state.agents);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const isLoading = useLoadingDelay(700);

  const activeCount = agents.filter((agent) => agent.status === "active").length;
  const idleCount = agents.filter((agent) => agent.status === "idle").length;
  const errorCount = agents.filter((agent) => agent.status === "error").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Agent Orchestration</h1>
          <p className="text-sm text-zinc-400">
            5 autonomous agents working in parallel to manage your pipeline
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 rounded-full bg-green-500/10 px-2.5 py-1 text-xs text-green-500">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            {activeCount} Active
          </span>
          <span className="flex items-center gap-2 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-500">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            {idleCount} Idle
          </span>
          {errorCount > 0 ? (
            <span className="flex items-center gap-2 rounded-full bg-red-500/10 px-2.5 py-1 text-xs text-red-500">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              {errorCount} Errors
            </span>
          ) : null}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="agents-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-[240px] w-full" />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="agents-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AgentGrid
              agents={agents}
              isAdmin={false}
              onToggle={() => null}
              onOpen={(agent) => setSelectedAgent(agent)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ActivityStream />

      {selectedAgent ? (
        <AgentDetailModal
          agent={selectedAgent}
          isAdmin={false}
          onClose={() => setSelectedAgent(null)}
        />
      ) : null}
    </div>
  );
}
