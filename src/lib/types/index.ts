export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  avatar: string;
  team: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  title: string;
  phone: string;
  source: "linkedin" | "google_ads" | "webinar" | "referral" | "cold_outreach";
  stage:
    | "new"
    | "contacted"
    | "qualified"
    | "proposal"
    | "negotiation"
    | "won"
    | "lost"
    | "cold";
  score: number;
  temperature: "hot" | "warm" | "cold";
  assignedTo: string;
  createdAt: string;
  lastActivityAt: string;
  nextFollowUp: string;
  tags: string[];
  notes: string[];
  emailsSent: number;
  emailsOpened: number;
  emailsReplied: number;
  callsMade: number;
  callsDuration: number;
  riskFlag: boolean;
  riskReason?: string;
  predictedWinProbability: number;
  value: number;
}

export interface Agent {
  id: string;
  name: string;
  type: "monitor" | "classifier" | "outreach" | "risk" | "research";
  status: "active" | "idle" | "error" | "paused";
  description: string;
  lastAction: string;
  lastActionAt: string;
  actionsToday: number;
  icon: string;
}

export interface AgentActivity {
  id: string;
  agentId: string;
  action: string;
  detail: string;
  leadId?: string;
  timestamp: string;
}

export interface EmailDraft {
  id: string;
  leadId: string;
  subject: string;
  body: string;
  status: "draft" | "queued" | "sent";
  scheduledAt?: string;
}

export interface FocusMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface MetricCard {
  label: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "flat";
}
