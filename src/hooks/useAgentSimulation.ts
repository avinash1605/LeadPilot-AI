import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAgentStore } from "@/lib/store/agent-store";
import { leads as mockLeads } from "@/lib/mock-data/leads";
import { useIntegrationStore } from "@/lib/store/integration-store";

const agentToolMap: Record<string, { integrationId: string; toolName: string; description: string }[]> = {
  monitor: [
    { integrationId: "linkedin", toolName: "search_leads", description: "Scanning LinkedIn for new leads" },
    { integrationId: "gmail", toolName: "read_inbox", description: "Checking Gmail for inbound replies" },
  ],
  classifier: [
    { integrationId: "salesforce", toolName: "update_opportunity", description: "Updating Salesforce opportunity" },
  ],
  outreach: [
    { integrationId: "gmail", toolName: "send_email", description: "Sending outreach email" },
    { integrationId: "gmail", toolName: "create_draft", description: "Creating follow-up draft" },
    { integrationId: "google-calendar", toolName: "create_event", description: "Scheduling a demo call" },
  ],
  risk: [
    { integrationId: "salesforce", toolName: "query_records", description: "Querying stalled deals" },
  ],
  research: [
    { integrationId: "linkedin", toolName: "get_profile", description: "Enriching LinkedIn profile" },
    { integrationId: "gmail", toolName: "search_emails", description: "Reviewing prior communications" },
  ],
};

const templates = {
  monitor: [
    "New lead detected from LinkedIn: {{name}} at {{company}}",
    "New lead detected from Google Ads: {{name}} at {{company}}",
    "Webinar attendee captured: {{name}} from {{company}}",
    "Referral lead received: {{name}} at {{company}}",
    "Duplicate lead merged: {{name}} — kept primary record",
  ],
  classifier: [
    "Scored {{name}} at {{company}} — Hot ({{score}}/100)",
    "Scored {{name}} at {{company}} — Warm ({{score}}/100)",
    "Scored {{name}} at {{company}} — Cold ({{score}}/100)",
    "Tagged {{name}} as {{tag}}",
    "Re-classified {{name}} — moved from Warm to Hot (score increased by {{delta}})",
    "Behavioral signal detected for {{name}}: visited pricing page 3 times",
  ],
  outreach: [
    "Email draft created for {{name}} — Subject: 'Quick Question About {{company}}'",
    "Follow-up email queued for {{name}} — scheduled for {{time}}",
    "Email sequence step 2 triggered for {{name}}",
    "Personalized intro email generated for {{name}} using company research",
    "A/B test variant B selected for {{name}} outreach",
  ],
  risk: [
    "⚠️ Flagged {{name}} at {{company}} — No response in {{days}} days",
    "⚠️ Risk alert: {{name}} — Competitor {{competitor}} mentioned",
    "⚠️ {{name}} engagement score dropped below threshold",
    "Risk cleared: {{name}} responded to follow-up email",
    "⚠️ Deal velocity alert: {{name}} stuck in {{stage}} for {{days}} days",
  ],
  research: [
    "Enriched profile: {{company}} — Revenue range: ${{revenue}}M",
    "Company update: {{company}} announced {{update}}",
    "Found LinkedIn update for {{name}}: promoted to {{title}}",
    "Tech stack detected for {{company}}: {{stack}}",
    "News alert: {{company}} featured in {{press}}",
  ],
} as const;

const competitors = ["Salesforce", "HubSpot", "Pipedrive"];
const tags = ["Enterprise", "SMB", "High-Intent", "Product-Led"];
const updates = ["new funding round", "product launch", "office expansion", "new CTO hire"];
const stacks = ["AWS, React, Salesforce", "GCP, Vue, HubSpot", "Azure, Angular, Dynamics"];
const press = ["TechCrunch", "Business Today", "Forbes India", "YourStory"];
const titles = ["VP Operations", "Head of Sales", "Revenue Director", "Chief of Staff"];

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T,>(items: readonly T[]) =>
  items[Math.floor(Math.random() * items.length)];

export function useAgentSimulation(enabled: boolean = true) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHotToast = useRef<number>(0);
  const lastRiskToast = useRef<number>(0);
  const { agents, addActivity, updateAgent } = useAgentStore();

  useEffect(() => {
    if (!enabled) return;

    const schedule = () => {
      const delay = randomBetween(4000, 8000);
      timerRef.current = setTimeout(() => {
        const activeAgents = agents.filter((agent) => agent.status === "active");
        if (activeAgents.length === 0) {
          schedule();
          return;
        }

        const agent = pick(activeAgents);
        const lead = pick(mockLeads);
        const template = pick(templates[agent.type]);
        const text = template
          .replace("{{name}}", lead.name)
          .replace("{{company}}", lead.company)
          .replace("{{score}}", `${randomBetween(10, 95)}`)
          .replace("{{tag}}", pick(tags))
          .replace("{{delta}}", `${randomBetween(8, 20)}`)
          .replace("{{time}}", `${randomBetween(2, 8)}pm`)
          .replace("{{days}}", `${randomBetween(7, 30)}`)
          .replace("{{competitor}}", pick(competitors))
          .replace("{{stage}}", pick(["proposal", "negotiation", "qualified"]))
          .replace("{{revenue}}", `${randomBetween(5, 50)}`)
          .replace("{{update}}", pick(updates))
          .replace("{{title}}", pick(titles))
          .replace("{{stack}}", pick(stacks))
          .replace("{{press}}", pick(press));

        const activity = {
          id: `sim-${Date.now()}`,
          agentId: agent.id,
          action: "Simulated update",
          detail: text,
          leadId: lead.id,
          timestamp: new Date().toISOString(),
        };

        addActivity(activity);
        updateAgent(agent.id, {
          lastAction: text,
          lastActionAt: activity.timestamp,
          actionsToday: agent.actionsToday + 1,
        });

        const now = Date.now();
        if (text.includes("Hot") && now - lastHotToast.current > 30000) {
          toast.info(
            `🔥 New hot lead detected: ${lead.name} at ${lead.company} (score: ${randomBetween(
              85,
              95
            )})`
          );
          lastHotToast.current = now;
        }
        if (text.includes("⚠️") && now - lastRiskToast.current > 30000) {
          const reason = text.replace("⚠️", "").trim();
          toast.warning(`⚠️ Lead at risk: ${lead.name} — ${reason}`);
          lastRiskToast.current = now;
        }

        if (Math.random() < 0.35) {
          const options = agentToolMap[agent.type] ?? [];
          if (options.length > 0) {
            const option = pick(options);
            const integrations = useIntegrationStore.getState().integrations;
            const integration = integrations.find(
              (item) =>
                item.id === option.integrationId && item.status === "connected"
            );
            const tool = integration?.tools.find(
              (entry) => entry.name === option.toolName && entry.enabled
            );
            if (integration && tool) {
              const duration = randomBetween(150, 520);
              const timestamp = new Date().toISOString();
              useIntegrationStore.getState().addToolCall({
                id: `call-${Date.now()}`,
                toolId: `${integration.id}-${option.toolName}`,
                toolName: option.toolName,
                integrationId: integration.id,
                integrationName: integration.name,
                integrationColor: integration.color,
                triggeredBy: agent.name,
                triggeredByType: "agent",
                status: "success",
                input: {
                  lead: lead.name,
                  company: lead.company,
                },
                output: {
                  status: "ok",
                  detail: option.description,
                },
                startedAt: timestamp,
                completedAt: new Date(Date.now() + duration).toISOString(),
                duration,
                leadName: lead.name,
              });
            }
          }
        }

        schedule();
      }, delay);
    };

    schedule();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [addActivity, agents, enabled, updateAgent]);
}
