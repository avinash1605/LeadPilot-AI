"use client";

import { PipelineMode } from "@/components/focus/pipeline-mode";

export default function UserPipelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Pipeline</h1>
        <p className="text-sm text-zinc-400">
          Track and move your leads through each stage.
        </p>
      </div>
      <PipelineMode />
    </div>
  );
}
