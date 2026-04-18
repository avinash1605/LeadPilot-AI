"use client";

import { useMemo, useState } from "react";
import { focusModes } from "@/lib/mock-data/focus-modes";
import { FocusModeCard } from "@/components/dashboard/focus-mode-card";

export default function UserFocusModesPage() {
  const [selectedMode, setSelectedMode] = useState("none");
  const options = useMemo(
    () => [
      { id: "none", name: "No focus mode" },
      ...focusModes.map((mode) => ({ id: mode.id, name: mode.name })),
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Focus Modes</h1>
          <p className="text-sm text-zinc-400">
            Pick a dedicated workspace to stay in flow.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs text-zinc-400">
          <span className="text-[11px] uppercase tracking-wider text-zinc-500">
            Focus
          </span>
          <select
            value={selectedMode}
            onChange={(event) => setSelectedMode(event.target.value)}
            className="bg-transparent text-sm text-white focus:outline-none"
          >
            {options.map((option) => (
              <option key={option.id} value={option.id} className="bg-zinc-900">
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {focusModes.map((mode, index) => (
          <FocusModeCard key={mode.id} mode={mode} index={index} />
        ))}
      </div>
    </div>
  );
}
