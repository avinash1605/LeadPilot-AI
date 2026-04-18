"use client";

import { CopilotHome } from "@/components/copilot/copilot-home";
import { focusModes } from "@/lib/mock-data/focus-modes";
import { useUiStore } from "@/lib/store/ui-store";

export default function UserDashboardPage() {
  const activeFocusMode = useUiStore((state) => state.activeFocusMode);
  const activeMode = focusModes.find((mode) => mode.id === activeFocusMode);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CopilotHome />
      {activeMode ? (
        <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h2 className="text-sm font-semibold text-white">
            Focus context: {activeMode.name}
          </h2>
          <p className="mt-1 text-xs text-zinc-400">{activeMode.description}</p>
        </section>
      ) : null}
    </div>
  );
}
