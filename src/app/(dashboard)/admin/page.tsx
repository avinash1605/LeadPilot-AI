"use client";

import { Suspense, lazy, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Flame,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PipelineFunnel } from "@/components/dashboard/pipeline-funnel";
import { AgentOverview } from "@/components/dashboard/agent-overview";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoadingDelay } from "@/hooks/useLoadingDelay";
import { dashboardMetrics } from "@/lib/mock-data/metrics";

const SourceChart = lazy(() =>
  import("@/components/dashboard/source-chart").then((module) => ({
    default: module.SourceChart,
  }))
);
const TeamPerformance = lazy(() =>
  import("@/components/dashboard/team-performance").then((module) => ({
    default: module.TeamPerformance,
  }))
);

const metricIcons = [
  Users,
  Flame,
  TrendingUp,
  Clock,
  DollarSign,
  AlertTriangle,
];

export default function AdminDashboardPage() {
  const [lastUpdated, setLastUpdated] = useState("2 min ago");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isLoading = useLoadingDelay(700);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated("just now");
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span>Last updated: {lastUpdated}</span>
          <motion.button
            type="button"
            onClick={handleRefresh}
            animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
          >
            <RefreshCw size={16} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="dashboard-skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-[110px] w-full" />
              ))}
            </div>
            <Skeleton className="h-[220px] w-full" />
            <div className="grid gap-6 lg:grid-cols-2">
              <Skeleton className="h-[340px] w-full" />
              <Skeleton className="h-[340px] w-full" />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <Skeleton className="h-[340px] w-full" />
              <Skeleton className="h-[340px] w-full" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
              {dashboardMetrics.map((metric, index) => (
                <MetricCard
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  change={metric.change}
                  trend={metric.trend}
                  icon={metricIcons[index]}
                  isBadTrend={metric.label === "At Risk"}
                  changeLabel={metric.label === "At Risk" ? "+5" : undefined}
                  index={index}
                />
              ))}
            </div>

            <PipelineFunnel />

            <div className="grid gap-6 lg:grid-cols-2">
              <Suspense fallback={<Skeleton className="h-[340px] w-full" />}>
                <SourceChart />
              </Suspense>
              <AgentOverview />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <ActivityFeed />
              <Suspense fallback={<Skeleton className="h-[340px] w-full" />}>
                <TeamPerformance />
              </Suspense>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
