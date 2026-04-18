"use client";

import { ConnectorsPanel } from "@/components/settings/connectors-panel";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-zinc-400">
          Connect the tools your AI agents can operate on behalf of your team.
        </p>
      </div>
      <ConnectorsPanel showMcpLinks />
    </div>
  );
}
