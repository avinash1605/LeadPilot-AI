import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  copilotOpen: boolean;
  activeFocusMode: string | null;
  focusModeSource: "route" | "manual" | null;
  activeFeedFilter: "alerts" | "actions" | "insights" | null;
  pulseSidebarOpen: boolean;
  searchOpen: boolean;
  toggleSidebar: () => void;
  toggleCopilot: () => void;
  togglePulseSidebar: () => void;
  toggleSearchOpen: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCopilotOpen: (open: boolean) => void;
  setFocusMode: (modeId: string | null, source?: "route" | "manual") => void;
  setFeedFilter: (filter: "alerts" | "actions" | "insights" | null) => void;
  setPulseSidebarOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  copilotOpen: false,
  activeFocusMode: null,
  focusModeSource: null,
  activeFeedFilter: null,
  pulseSidebarOpen: true,
  searchOpen: false,
  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),
  toggleCopilot: () =>
    set((state) => ({
      copilotOpen: !state.copilotOpen,
    })),
  togglePulseSidebar: () =>
    set((state) => ({
      pulseSidebarOpen: !state.pulseSidebarOpen,
    })),
  toggleSearchOpen: () =>
    set((state) => ({
      searchOpen: !state.searchOpen,
    })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCopilotOpen: (open) => set({ copilotOpen: open }),
  setFocusMode: (modeId, source = "manual") =>
    set({ activeFocusMode: modeId, focusModeSource: modeId ? source : null }),
  setFeedFilter: (filter) => set({ activeFeedFilter: filter }),
  setPulseSidebarOpen: (open) => set({ pulseSidebarOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
}));
