import { create } from "zustand";

interface AppState {
  activeWorkspace: string;
  setActiveWorkspace: (workspace: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeWorkspace: "LeadPilot HQ",
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
}));
