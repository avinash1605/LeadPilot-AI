import { create } from "zustand";
import { voiceConfig } from "@/lib/voice-config";

export type VoiceMode = "idle" | "listening" | "processing" | "speaking";

interface VoiceStore {
  voiceMode: VoiceMode;
  isVoiceEnabled: boolean;
  transcript: string;
  useElevenLabs: boolean;
  startListening: () => void;
  stopListening: () => void;
  setTranscript: (text: string) => void;
  setVoiceMode: (mode: VoiceMode) => void;
  setSpeaking: (speaking: boolean) => void;
  toggleVoiceEnabled: () => void;
  reset: () => void;
}

export const useVoiceStore = create<VoiceStore>((set) => ({
  voiceMode: "idle",
  isVoiceEnabled: false,
  transcript: "",
  useElevenLabs: voiceConfig.isElevenLabsAvailable(),
  startListening: () => set({ voiceMode: "listening" }),
  stopListening: () => set({ voiceMode: "processing" }),
  setTranscript: (text) => set({ transcript: text }),
  setVoiceMode: (mode) => set({ voiceMode: mode }),
  setSpeaking: (speaking) =>
    set({ voiceMode: speaking ? "speaking" : "idle" }),
  toggleVoiceEnabled: () =>
    set((state) => ({ isVoiceEnabled: !state.isVoiceEnabled })),
  reset: () =>
    set({
      voiceMode: "idle",
      transcript: "",
    }),
}));
