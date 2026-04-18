"use client";

import { cn } from "@/lib/utils";

interface VoiceWaveformProps {
  active: boolean;
}

export function VoiceWaveform({ active }: VoiceWaveformProps) {
  return (
    <div className="flex items-end gap-0.5">
      {Array.from({ length: 7 }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "w-1 rounded-full bg-indigo-400",
            active ? "animate-[soundbar_0.5s_ease-in-out_infinite]" : "h-2"
          )}
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </div>
  );
}
