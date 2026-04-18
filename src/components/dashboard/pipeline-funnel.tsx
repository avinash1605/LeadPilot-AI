"use client";

import { motion } from "framer-motion";
import { pipelineStages } from "@/lib/mock-data/metrics";

const stageColors = [
  "bg-indigo-600",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-purple-600",
  "bg-green-500",
  "bg-red-500",
];

const stageDetails = [
  { days: 2.4, value: "$480k" },
  { days: 3.1, value: "$520k" },
  { days: 4.2, value: "$450k" },
  { days: 5.6, value: "$380k" },
  { days: 6.4, value: "$310k" },
  { days: 8.2, value: "$260k" },
  { days: 3.5, value: "$150k" },
];

export function PipelineFunnel() {
  const conversionRates = pipelineStages.slice(1).map((stage, index) => {
    const prev = pipelineStages[index].count;
    return Math.round((stage.count / prev) * 100);
  });

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Pipeline Funnel</h2>
        <span className="text-sm text-zinc-500">Last 30 days</span>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {pipelineStages.map((stage, index) => {
          const width = 100 - index * 8;
          const conversion =
            index === 0 ? 100 : conversionRates[index - 1] ?? 0;
          const detail = stageDetails[index];
          return (
            <motion.div
              key={stage.stage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.2 }}
              className="relative flex flex-1 flex-col items-center gap-2"
            >
              <span className="text-xs text-zinc-400">{stage.stage}</span>
              <div
                className={`group relative flex h-12 items-center justify-center text-sm font-semibold text-white ${stageColors[index]}`}
                style={{
                  width: `${width}%`,
                  clipPath: "polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%)",
                }}
              >
                {stage.count}
                <div className="pointer-events-none absolute -top-20 left-1/2 hidden w-40 -translate-x-1/2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 shadow-xl group-hover:block">
                  <p className="font-semibold text-white">{stage.stage}</p>
                  <p>Count: {stage.count}</p>
                  <p>Total value: {detail.value}</p>
                  <p>Avg days: {detail.days}</p>
                </div>
              </div>
              <span className="text-xs text-zinc-500">
                {conversion}% from prev
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-xs text-zinc-500">
        {conversionRates.map((rate, index) => (
          <span key={pipelineStages[index + 1].stage}>
            {pipelineStages[index].stage}→{pipelineStages[index + 1].stage}:{" "}
            {rate}%
          </span>
        ))}
      </div>
    </div>
  );
}
