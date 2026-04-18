import { create } from "zustand";

export type IntegrationStatus = "connected" | "available" | "error";
export type IntegrationCategory =
  | "sourcing"
  | "crm"
  | "communication"
  | "calendar"
  | "analytics"
  | "automation";

export interface ToolParameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface IntegrationTool {
  id: string;
  name: string;
  description: string;
  integrationId: string;
  parameters: ToolParameter[];
  usageCount: number;
  enabled: boolean;
  example?: {
    request: Record<string, unknown>;
    response: Record<string, unknown>;
  };
  lastUsed?: string;
}

export interface Integration {
  id: string;
  name: string;
  provider: string;
  category: IntegrationCategory;
  icon: string;
  color: string;
  status: IntegrationStatus;
  description: string;
  mcpEndpoint?: string;
  transport?: "sse" | "http" | "stdio";
  authMethod?: "oauth" | "api-key" | "bearer" | "none";
  connectedAt?: string;
  tools: IntegrationTool[];
  callsToday?: number;
  avgLatency?: number;
  successRate?: number;
}

export interface ToolCall {
  id: string;
  toolId: string;
  toolName: string;
  integrationId: string;
  integrationName: string;
  integrationColor: string;
  triggeredBy: string;
  triggeredByType: "agent" | "copilot";
  status: "pending" | "executing" | "success" | "error";
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  leadName?: string;
}

const baseIntegrations: Integration[] = [
  {
    id: "linkedin",
    name: "LinkedIn Sales Navigator",
    provider: "LinkedIn",
    category: "sourcing",
    icon: "Link2",
    color: "blue",
    status: "connected",
    description: "Pull inbound LinkedIn leads and InMail signals.",
    mcpEndpoint: "https://mcp.linkedin.salesnavigator.com/v1",
    transport: "sse",
    authMethod: "oauth",
    connectedAt: "2026-04-10T09:00:00Z",
    callsToday: 113,
    avgLatency: 380,
    successRate: 99.7,
    tools: [
      {
        id: "li-search",
        name: "search_leads",
        description: "Search LinkedIn for leads matching criteria.",
        integrationId: "linkedin",
        enabled: true,
        parameters: [
          { name: "query", type: "string", required: true, description: "Search query" },
          { name: "filters", type: "object", required: false, description: "Advanced filters" },
        ],
        usageCount: 34,
        example: {
          request: { query: "VP Sales SaaS India", filters: { seniority: "VP" } },
          response: { matches: 24 },
        },
      },
      {
        id: "li-profile",
        name: "get_profile",
        description: "Get full LinkedIn profile for a lead.",
        integrationId: "linkedin",
        enabled: true,
        parameters: [
          { name: "profile_url", type: "string", required: true, description: "LinkedIn profile URL" },
        ],
        usageCount: 67,
        example: {
          request: { profile_url: "https://linkedin.com/in/arjun" },
          response: { name: "Arjun Nair", title: "Director of RevOps" },
        },
      },
      {
        id: "li-inmail",
        name: "send_inmail",
        description: "Send InMail to a LinkedIn lead.",
        integrationId: "linkedin",
        enabled: true,
        parameters: [
          { name: "profile_id", type: "string", required: true, description: "LinkedIn profile ID" },
          { name: "message", type: "string", required: true, description: "InMail body" },
        ],
        usageCount: 12,
        example: {
          request: { profile_id: "abc123", message: "Loved your recent post..." },
          response: { status: "sent" },
        },
      },
    ],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    provider: "Salesforce",
    category: "crm",
    icon: "Cloud",
    color: "cyan",
    status: "connected",
    description: "Sync contacts, opportunities, and pipeline stages.",
    mcpEndpoint: "https://mcp.salesforce.com/v1",
    transport: "sse",
    authMethod: "api-key",
    connectedAt: "2026-04-08T14:00:00Z",
    callsToday: 153,
    avgLatency: 220,
    successRate: 99.9,
    tools: [
      {
        id: "sf-create",
        name: "create_contact",
        description: "Create a new contact in Salesforce.",
        integrationId: "salesforce",
        enabled: true,
        parameters: [
          { name: "name", type: "string", required: true },
          { name: "email", type: "string", required: true },
          { name: "company", type: "string", required: true },
        ],
        usageCount: 23,
        example: {
          request: { name: "Arjun Nair", email: "arjun@technova.com", company: "TechNova" },
          response: { contact_id: "0035g00000hTo2B" },
        },
      },
      {
        id: "sf-update",
        name: "update_opportunity",
        description: "Update opportunity stage and value.",
        integrationId: "salesforce",
        enabled: true,
        parameters: [
          { name: "opportunity_id", type: "string", required: true },
          { name: "stage", type: "string", required: false },
          { name: "value", type: "number", required: false },
        ],
        usageCount: 41,
        example: {
          request: { opportunity_id: "0065g00000J", stage: "Proposal" },
          response: { updated: true },
        },
      },
      {
        id: "sf-query",
        name: "query_records",
        description: "SOQL query on Salesforce records.",
        integrationId: "salesforce",
        enabled: true,
        parameters: [{ name: "query", type: "string", required: true }],
        usageCount: 89,
        example: {
          request: { query: "SELECT Id, Name FROM Account" },
          response: { totalSize: 34, records: [] },
        },
      },
    ],
  },
  {
    id: "hubspot",
    name: "HubSpot",
    provider: "HubSpot",
    category: "crm",
    icon: "Boxes",
    color: "orange",
    status: "available",
    description: "Import existing contacts and email engagement.",
    tools: [
      {
        id: "hs-import",
        name: "import_contacts",
        description: "Import contacts from HubSpot.",
        integrationId: "hubspot",
        enabled: false,
        parameters: [{ name: "list_id", type: "string", required: false }],
        usageCount: 0,
      },
      {
        id: "hs-sync",
        name: "sync_engagement",
        description: "Sync email engagement data.",
        integrationId: "hubspot",
        enabled: false,
        parameters: [{ name: "since", type: "string", required: false }],
        usageCount: 0,
      },
      {
        id: "hs-companies",
        name: "get_companies",
        description: "Get company records.",
        integrationId: "hubspot",
        enabled: false,
        parameters: [{ name: "query", type: "string", required: false }],
        usageCount: 0,
      },
    ],
  },
  {
    id: "gmail",
    name: "Gmail",
    provider: "Google",
    category: "communication",
    icon: "Mail",
    color: "red",
    status: "connected",
    description: "Send emails and capture replies inside LeadPilot.",
    mcpEndpoint: "https://mcp.gmail.googleapis.com/v1",
    transport: "sse",
    authMethod: "oauth",
    connectedAt: "2026-04-08T10:00:00Z",
    callsToday: 368,
    avgLatency: 320,
    successRate: 99.8,
    tools: [
      {
        id: "gm-send",
        name: "send_email",
        description: "Send an email via Gmail.",
        integrationId: "gmail",
        enabled: true,
        parameters: [
          { name: "to", type: "string", required: true, description: "Recipient email" },
          { name: "subject", type: "string", required: true, description: "Subject line" },
          { name: "body", type: "string", required: true, description: "Body (HTML supported)" },
          { name: "cc", type: "string[]", required: false, description: "CC list" },
          { name: "bcc", type: "string[]", required: false, description: "BCC list" },
        ],
        usageCount: 156,
        example: {
          request: {
            to: "arjun@technova.com",
            subject: "Following Up on Our Discussion",
            body: "<p>Hi Arjun,</p>",
          },
          response: {
            message_id: "msg_18f3a2b4c9e1",
            status: "sent",
          },
        },
      },
      {
        id: "gm-read",
        name: "read_inbox",
        description: "Read recent emails from inbox.",
        integrationId: "gmail",
        enabled: true,
        parameters: [
          { name: "query", type: "string", required: false },
          { name: "max_results", type: "number", required: false },
        ],
        usageCount: 78,
        example: {
          request: { query: "is:unread", max_results: 20 },
          response: { messages: [] },
        },
      },
      {
        id: "gm-draft",
        name: "create_draft",
        description: "Create an email draft.",
        integrationId: "gmail",
        enabled: true,
        parameters: [
          { name: "to", type: "string", required: true },
          { name: "subject", type: "string", required: true },
          { name: "body", type: "string", required: true },
        ],
        usageCount: 43,
        example: {
          request: { to: "arjun@technova.com", subject: "Follow-up", body: "..." },
          response: { draft_id: "dr_99a1" },
        },
      },
      {
        id: "gm-search",
        name: "search_emails",
        description: "Search emails by query.",
        integrationId: "gmail",
        enabled: true,
        parameters: [{ name: "query", type: "string", required: true }],
        usageCount: 91,
        example: {
          request: { query: "from:arjun@technova.com" },
          response: { messages: [] },
        },
      },
      {
        id: "gm-thread",
        name: "get_thread",
        description: "Get full email thread.",
        integrationId: "gmail",
        enabled: false,
        parameters: [{ name: "thread_id", type: "string", required: true }],
        usageCount: 0,
      },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    provider: "Slack",
    category: "communication",
    icon: "Hash",
    color: "purple",
    status: "available",
    description: "Receive lead alerts and AI summaries in channels.",
    tools: [
      {
        id: "sl-send",
        name: "send_message",
        description: "Send a message to channel/user.",
        integrationId: "slack",
        enabled: false,
        parameters: [
          { name: "channel", type: "string", required: true },
          { name: "text", type: "string", required: true },
        ],
        usageCount: 0,
      },
      {
        id: "sl-notify",
        name: "send_notification",
        description: "Send structured notification.",
        integrationId: "slack",
        enabled: false,
        parameters: [
          { name: "channel", type: "string", required: true },
          { name: "title", type: "string", required: true },
          { name: "body", type: "string", required: true },
        ],
        usageCount: 0,
      },
      {
        id: "sl-search",
        name: "search_messages",
        description: "Search Slack messages.",
        integrationId: "slack",
        enabled: false,
        parameters: [{ name: "query", type: "string", required: true }],
        usageCount: 0,
      },
    ],
  },
  {
    id: "intercom",
    name: "Intercom",
    provider: "Intercom",
    category: "communication",
    icon: "MessageCircle",
    color: "blue",
    status: "available",
    description: "Bring chat conversations into your lead activity feed.",
    tools: [
      {
        id: "ic-get",
        name: "get_conversations",
        description: "Get recent chat conversations.",
        integrationId: "intercom",
        enabled: false,
        parameters: [{ name: "limit", type: "number", required: false }],
        usageCount: 0,
      },
      {
        id: "ic-search",
        name: "search_contacts",
        description: "Search Intercom contacts.",
        integrationId: "intercom",
        enabled: false,
        parameters: [{ name: "query", type: "string", required: true }],
        usageCount: 0,
      },
    ],
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    provider: "Google",
    category: "calendar",
    icon: "Calendar",
    color: "emerald",
    status: "connected",
    description: "Schedule meetings and check availability.",
    mcpEndpoint: "https://mcp.calendar.googleapis.com/v1",
    transport: "sse",
    authMethod: "oauth",
    connectedAt: "2026-04-09T11:00:00Z",
    callsToday: 120,
    avgLatency: 210,
    successRate: 99.6,
    tools: [
      {
        id: "gc-create",
        name: "create_event",
        description: "Create a calendar event.",
        integrationId: "google-calendar",
        enabled: true,
        parameters: [
          { name: "title", type: "string", required: true },
          { name: "start_time", type: "string", required: true },
          { name: "end_time", type: "string", required: true },
          { name: "attendees", type: "string[]", required: false },
        ],
        usageCount: 28,
        example: {
          request: {
            title: "Demo call with Meera Kapoor",
            start_time: "2026-04-18T14:00:00Z",
            end_time: "2026-04-18T14:30:00Z",
          },
          response: { event_id: "evt_98a" },
        },
      },
      {
        id: "gc-list",
        name: "list_events",
        description: "List upcoming events.",
        integrationId: "google-calendar",
        enabled: true,
        parameters: [{ name: "date", type: "string", required: false }],
        usageCount: 55,
        example: { request: { date: "2026-04-18" }, response: { events: [] } },
      },
      {
        id: "gc-avail",
        name: "check_availability",
        description: "Check free/busy status.",
        integrationId: "google-calendar",
        enabled: true,
        parameters: [{ name: "date", type: "string", required: true }],
        usageCount: 37,
        example: {
          request: { date: "2026-04-18" },
          response: { busy_slots: [] },
        },
      },
      {
        id: "gc-update",
        name: "update_event",
        description: "Update an existing event.",
        integrationId: "google-calendar",
        enabled: false,
        parameters: [{ name: "event_id", type: "string", required: true }],
        usageCount: 0,
      },
    ],
  },
];

const now = Date.now();
const seconds = (n: number) => new Date(now - n * 1000).toISOString();

const seedCalls: ToolCall[] = [
  {
    id: "call-1",
    toolId: "gm-send",
    toolName: "send_email",
    integrationId: "gmail",
    integrationName: "Gmail",
    integrationColor: "red",
    triggeredBy: "Outreach Agent",
    triggeredByType: "agent",
    status: "success",
    input: { to: "arjun@technova.com", subject: "Following up" },
    output: { message_id: "msg_18f3a2b4c9e1", status: "sent" },
    startedAt: seconds(15),
    completedAt: seconds(14),
    duration: 320,
    leadName: "Arjun Nair",
  },
  {
    id: "call-2",
    toolId: "li-search",
    toolName: "search_leads",
    integrationId: "linkedin",
    integrationName: "LinkedIn Sales Navigator",
    integrationColor: "blue",
    triggeredBy: "Monitor Agent",
    triggeredByType: "agent",
    status: "success",
    input: { query: "VP Sales in SaaS India" },
    output: { matches: 24 },
    startedAt: seconds(60),
    completedAt: seconds(59),
    duration: 450,
  },
  {
    id: "call-3",
    toolId: "sf-update",
    toolName: "update_opportunity",
    integrationId: "salesforce",
    integrationName: "Salesforce",
    integrationColor: "cyan",
    triggeredBy: "Classifier Agent",
    triggeredByType: "agent",
    status: "success",
    input: { opportunity_id: "opp-871", stage: "Proposal" },
    output: { updated: true },
    startedAt: seconds(120),
    completedAt: seconds(119),
    duration: 190,
    leadName: "TechNova Solutions",
  },
  {
    id: "call-4",
    toolId: "gc-create",
    toolName: "create_event",
    integrationId: "google-calendar",
    integrationName: "Google Calendar",
    integrationColor: "emerald",
    triggeredBy: "Copilot",
    triggeredByType: "copilot",
    status: "success",
    input: { title: "Demo call with Meera Kapoor" },
    output: { event_id: "evt_88d" },
    startedAt: seconds(240),
    completedAt: seconds(239),
    duration: 250,
    leadName: "Meera Kapoor",
  },
];

interface IntegrationState {
  integrations: Integration[];
  toolCalls: ToolCall[];
  toggleIntegration: (id: string) => void;
  addToolCall: (call: ToolCall) => void;
  toggleTool: (integrationId: string, toolId: string) => void;
  setAllTools: (integrationId: string, enabled: boolean) => void;
  connectServer: (id: string) => void;
  disconnectServer: (id: string) => void;
  addCustomServer: (server: Integration) => void;
  removeServer: (id: string) => void;
  getEnabledTools: (id: string) => IntegrationTool[];
  getConnectedServers: () => Integration[];
  getTotalToolCount: () => { enabled: number; disabled: number; total: number };
}

export const useIntegrationStore = create<IntegrationState>((set, get) => ({
  integrations: baseIntegrations,
  toolCalls: seedCalls,
  toggleIntegration: (id) =>
    set((state) => ({
      integrations: state.integrations.map((integration) =>
        integration.id === id
          ? {
              ...integration,
              status:
                integration.status === "connected" ? "available" : "connected",
              connectedAt:
                integration.status === "connected"
                  ? undefined
                  : new Date().toISOString(),
              tools: integration.tools.map((tool) => ({
                ...tool,
                enabled:
                  integration.status === "connected" ? false : tool.enabled,
              })),
            }
          : integration
      ),
    })),
  addToolCall: (call) =>
    set((state) => ({ toolCalls: [call, ...state.toolCalls].slice(0, 120) })),
  toggleTool: (integrationId, toolId) =>
    set((state) => ({
      integrations: state.integrations.map((integration) =>
        integration.id !== integrationId
          ? integration
          : {
              ...integration,
              tools: integration.tools.map((tool) =>
                tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool
              ),
            }
      ),
    })),
  setAllTools: (integrationId, enabled) =>
    set((state) => ({
      integrations: state.integrations.map((integration) =>
        integration.id !== integrationId
          ? integration
          : {
              ...integration,
              tools: integration.tools.map((tool) => ({ ...tool, enabled })),
            }
      ),
    })),
  connectServer: (id) =>
    set((state) => ({
      integrations: state.integrations.map((integration) =>
        integration.id === id
          ? {
              ...integration,
              status: "connected",
              connectedAt: new Date().toISOString(),
              tools: integration.tools.map((tool) => ({
                ...tool,
                enabled: true,
              })),
            }
          : integration
      ),
    })),
  disconnectServer: (id) =>
    set((state) => ({
      integrations: state.integrations.map((integration) =>
        integration.id === id
          ? {
              ...integration,
              status: "available",
              connectedAt: undefined,
              tools: integration.tools.map((tool) => ({
                ...tool,
                enabled: false,
              })),
            }
          : integration
      ),
    })),
  addCustomServer: (server) =>
    set((state) => ({ integrations: [...state.integrations, server] })),
  removeServer: (id) =>
    set((state) => ({
      integrations: state.integrations.filter((item) => item.id !== id),
    })),
  getEnabledTools: (id) =>
    get().integrations.find((item) => item.id === id)?.tools.filter(
      (tool) => tool.enabled
    ) ?? [],
  getConnectedServers: () =>
    get().integrations.filter((item) => item.status === "connected"),
  getTotalToolCount: () => {
    const tools = get().integrations.flatMap((item) => item.tools);
    const enabled = tools.filter((tool) => tool.enabled).length;
    return {
      enabled,
      disabled: tools.length - enabled,
      total: tools.length,
    };
  },
}));

export const integrationAgentMap: Record<string, string[]> = {
  "Monitor Agent": ["linkedin", "gmail"],
  "Classifier Agent": ["salesforce"],
  "Outreach Agent": ["gmail", "google-calendar"],
  "Risk Agent": ["salesforce"],
  "Research Agent": ["linkedin", "gmail"],
};
