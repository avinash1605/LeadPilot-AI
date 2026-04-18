import { create } from "zustand";
import type { Agent, AgentActivity } from "@/lib/types";
import { agents as mockAgents, agentActivityLog } from "@/lib/mock-data/agents";

interface AgentState {
  agents: Agent[];
  activityLog: AgentActivity[];
  toggleAgent: (id: string) => void;
  addActivity: (activity: AgentActivity) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  updateAllAgents: (updates: Partial<Agent>) => void;
  updateAgents: (updater: (agents: Agent[]) => Agent[]) => void;
  getAgentById: (id: string) => Agent | undefined;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: mockAgents,
  activityLog: agentActivityLog,
  toggleAgent: (id) =>
    set((state) => ({
      agents: state.agents.map((agent) => {
        if (agent.id !== id) return agent;
        if (agent.status === "paused") {
          return { ...agent, status: "active" };
        }
        if (agent.status === "active" || agent.status === "idle") {
          return { ...agent, status: "paused" };
        }
        return agent;
      }),
    })),
  addActivity: (activity) =>
    set((state) => ({
      activityLog: [activity, ...state.activityLog].slice(0, 100),
    })),
  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id ? { ...agent, ...updates } : agent
      ),
    })),
  updateAllAgents: (updates) =>
    set((state) => ({
      agents: state.agents.map((agent) => ({ ...agent, ...updates })),
    })),
  updateAgents: (updater) =>
    set((state) => ({
      agents: updater(state.agents),
    })),
  getAgentById: (id) => get().agents.find((agent) => agent.id === id),
}));
