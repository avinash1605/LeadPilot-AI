import { create } from "zustand";
import type { Lead, User } from "@/lib/types";
import { generateCopilotResponse } from "@/lib/copilot-engine";

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  type:
    | "text"
    | "lead-card"
    | "action-card"
    | "metric-card"
    | "email-draft";
  data?: any;
  timestamp: string;
}

interface CopilotStore {
  messages: CopilotMessage[];
  currentContext: string;
  isTyping: boolean;
  isOpen: boolean;
  sendMessage: (text: string, user?: User | null, leads?: Lead[]) => void;
  clearChat: () => void;
  setContext: (context: string) => void;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
}

const randomDelay = () => 800 + Math.floor(Math.random() * 700);

export const useCopilotStore = create<CopilotStore>((set, get) => ({
  messages: [],
  currentContext: "Dashboard",
  isTyping: false,
  isOpen: true,
  sendMessage: (text, user, leads = []) => {
    const timestamp = new Date().toISOString();
    const userMessage: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      type: "text",
      timestamp,
    };
    set((state) => ({
      messages: [...state.messages, userMessage],
      isTyping: true,
    }));

    setTimeout(() => {
      const context = get().currentContext;
      const assistantMessage = generateCopilotResponse(
        text,
        context,
        user ?? null,
        leads
      );
      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isTyping: false,
      }));
    }, randomDelay());
  },
  clearChat: () => set({ messages: [] }),
  setContext: (context) => set({ currentContext: context }),
  setOpen: (open) => set({ isOpen: open }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
}));
