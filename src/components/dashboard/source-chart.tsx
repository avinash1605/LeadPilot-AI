"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { sourceBreakdown } from "@/lib/mock-data/metrics";

const chartData = sourceBreakdown.map((item) => ({
  name: item.source,
  value: item.count,
  percentage: item.percentage,
  color: item.color,
}));

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number; percentage: number } }>;
}) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white shadow-xl">
      <p className="font-semibold">{data.name}</p>
      <p>
        {data.value} leads · {data.percentage}%
      </p>
    </div>
  );
};

export function SourceChart() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-lg font-semibold text-white">Lead Sources</h2>
      <div className="mt-6 grid grid-cols-1 items-center gap-6 md:grid-cols-2">
        <div className="relative h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                isAnimationActive
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-semibold text-white">524</p>
            <p className="text-xs text-zinc-500">Total Leads</p>
          </div>
        </div>
        <div className="space-y-2">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-3 text-sm">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="flex-1 text-zinc-300">{item.name}</span>
              <span className="text-zinc-500">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
