"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Mic, Volume2 } from "lucide-react";
import { voiceConfig } from "@/lib/voice-config";
import { VoiceBadge } from "@/components/copilot/voice-badge";
import { cn } from "@/lib/utils";

interface VoiceOrbProps {
  state: "idle" | "listening" | "processing" | "speaking";
  size: "sm" | "lg";
}

export function VoiceOrb({ state, size }: VoiceOrbProps) {
  const dimension = size === "lg" ? "h-20 w-20" : "h-12 w-12";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        initial={{ opacity: 0.6, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-full border border-zinc-700",
          dimension,
          state === "idle" && "bg-zinc-800 text-zinc-400 animate-[pulse_3s_ease-in-out_infinite]",
          state === "listening" && "bg-indigo-600 text-white shadow-[0_0_30px_rgba(99,102,241,0.4)]",
          state === "processing" && "border-indigo-500/40 bg-indigo-500/20 text-indigo-400",
          state === "speaking" && "bg-indigo-600 text-white shadow-[0_0_40px_rgba(99,102,241,0.3)]"
        )}
      >
        {state === "idle" ? <Mic size={size === "lg" ? 24 : 18} /> : null}
        {state === "processing" ? (
          <Loader2 className="animate-spin" size={size === "lg" ? 24 : 18} />
        ) : null}
        {state === "listening" ? <Mic size={size === "lg" ? 24 : 18} /> : null}
        {state === "speaking" ? <Volume2 size={size === "lg" ? 24 : 18} /> : null}

        {state === "listening" ? (
          <>
            {[0, 1, 2].map((ring) => (
              <span
                key={ring}
                className="absolute inset-0 rounded-full border border-indigo-400/60 animate-[ripple_1.5s_ease-out_infinite]"
                style={{ animationDelay: `${ring * 0.3}s` }}
              />
            ))}
          </>
        ) : null}

        {state === "speaking" ? (
          <div className="absolute bottom-2 flex items-end gap-0.5">
            {[0, 1, 2, 3, 4].map((bar) => (
              <span
                key={bar}
                className="w-1 rounded-full bg-white animate-[soundbar_0.5s_ease-in-out_infinite]"
                style={{ animationDelay: `${bar * 0.1}s` }}
              />
            ))}
          </div>
        ) : null}

        {state === "idle" ? (
          <div className="absolute -bottom-6">
            <VoiceBadge useElevenLabs={voiceConfig.isElevenLabsAvailable()} />
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
