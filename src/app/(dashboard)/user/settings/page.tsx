"use client";

import { ConnectorsPanel } from "@/components/settings/connectors-panel";

export default function UserSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-zinc-400">
          Connect your tools so LeadPilot can stream lead data into your workspace.
        </p>
      </div>
      <ConnectorsPanel />
    </div>
  );
}
