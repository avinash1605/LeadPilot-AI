import type { FocusMode } from "@/lib/types";

export const focusModes: FocusMode[] = [
  {
    id: "lead-emailing",
    name: "Lead Emailing",
    description: "Draft, review and send personalized emails",
    icon: "Mail",
    color: "indigo",
  },
  {
    id: "lead-calling",
    name: "Lead Calling",
    description: "Call prep, scripts and follow-up notes",
    icon: "Phone",
    color: "emerald",
  },
  {
    id: "pipeline-review",
    name: "Pipeline Review",
    description: "Visual pipeline and stage management",
    icon: "KanbanSquare",
    color: "amber",
  },
  {
    id: "lead-research",
    name: "Lead Research",
    description: "AI-powered lead enrichment and insights",
    icon: "Search",
    color: "violet",
  },
  {
    id: "follow-up-queue",
    name: "Follow-up Queue",
    description: "Overdue leads and priority actions",
    icon: "Clock",
    color: "rose",
  },
];
