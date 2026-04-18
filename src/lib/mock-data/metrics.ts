import type { MetricCard } from "@/lib/types";

export const dashboardMetrics: MetricCard[] = [
  { label: "Total Leads", value: "524", change: 12, trend: "up" },
  { label: "Hot Leads", value: "47", change: 8, trend: "up" },
  { label: "Conversion Rate", value: "5.2%", change: 0.3, trend: "up" },
  { label: "Avg Response", value: "2.4h", change: -18, trend: "down" },
  { label: "Pipeline Value", value: "$2.1M", change: 5, trend: "up" },
  { label: "At Risk", value: "38", change: 5, trend: "up" },
];

export const sourceBreakdown = [
  { source: "LinkedIn", count: 184, percentage: 35, color: "#0A66C2" },
  { source: "Google Ads", count: 131, percentage: 25, color: "#34A853" },
  { source: "Webinar", count: 105, percentage: 20, color: "#8B5CF6" },
  { source: "Referral", count: 79, percentage: 15, color: "#F59E0B" },
  { source: "Cold Outreach", count: 25, percentage: 5, color: "#6B7280" },
];

export const pipelineStages = [
  { stage: "New", count: 180, value: 480000 },
  { stage: "Contacted", count: 142, value: 520000 },
  { stage: "Qualified", count: 89, value: 450000 },
  { stage: "Proposal", count: 52, value: 380000 },
  { stage: "Negotiation", count: 31, value: 310000 },
  { stage: "Won", count: 18, value: 260000 },
  { stage: "Lost", count: 12, value: 150000 },
];

export const teamPerformance = [
  { name: "Ananya Singh", leads: 52, conversions: 15, conversionRate: 28.8 },
  { name: "Rahul Mehta", leads: 45, conversions: 12, conversionRate: 26.7 },
  { name: "Vikram Patel", leads: 38, conversions: 9, conversionRate: 23.7 },
];
