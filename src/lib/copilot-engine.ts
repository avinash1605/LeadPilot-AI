import { formatDistanceToNow } from "date-fns";
import type { Lead, User } from "@/lib/types";

export function generateMockResponse(
  message: string,
  userLeads: Lead[],
  user?: User | null
): { text: string } {
  const lower = message.toLowerCase();
  const firstName = user?.name.split(" ")[0] ?? "there";

  if (
    lower.includes("hot leads") ||
    lower.includes("brief") ||
    lower.includes("today") ||
    lower.includes("morning brief")
  ) {
    const hotLeads = userLeads
      .filter((lead) => lead.temperature === "hot")
      .slice(0, 5);
    const lines = hotLeads.map((lead) => {
      const relative = formatDistanceToNow(new Date(lead.lastActivityAt), {
        addSuffix: true,
      });
      return `🔥 ${lead.name} at ${lead.company} — Score: ${lead.score}/100 — $${lead.value.toLocaleString()} deal\n   Last activity: ${relative}. Suggested action: Send a follow-up.`;
    });
    return {
      text: `Here's your briefing for today, ${firstName}. You have ${hotLeads.length} hot leads that need attention:\n\n${lines.join(
        "\n\n"
      )}`,
    };
  }

  if (
    lower.includes("risk") ||
    lower.includes("at risk") ||
    lower.includes("cold") ||
    lower.includes("losing")
  ) {
    const risky = userLeads.filter((lead) => lead.riskFlag);
    const lines = risky.map(
      (lead) =>
        `⚠️ ${lead.name} at ${lead.company} — Risk: ${lead.riskReason ?? "Needs attention"}\n   Score dropped to ${lead.score}. Suggested action: Schedule a call.`
    );
    return {
      text: `I've identified ${risky.length} leads at risk in your pipeline:\n\n${lines.join(
        "\n\n"
      )}`,
    };
  }

  if (
    lower.includes("email") ||
    lower.includes("draft") ||
    lower.includes("write")
  ) {
    const lead = userLeads[0];
    return {
      text: `Here's a draft email for your lead:\n\n📧 Subject: Following Up on Our Conversation\n---\nHi ${lead?.name ?? "there"},\n\nI hope this message finds you well. I wanted to follow up on our recent discussion about ${lead?.company ?? "your team's"} needs in lead operations.\n\nBased on what you shared, I believe our solution could help you achieve faster pipeline visibility. I'd love to schedule a quick 15-minute call this week to explore this further.\n\nWould Thursday at 3 PM work for you?\n\nBest regards,\n${user?.name ?? "LeadPilot Rep"}`,
    };
  }

  if (
    lower.includes("prioritize") ||
    lower.includes("priority") ||
    lower.includes("what should i") ||
    lower.includes("plan")
  ) {
    const overdueLead = userLeads[0];
    const negotiationLead = userLeads.find(
      (lead) => lead.stage === "negotiation"
    );
    const hotLead = userLeads.find((lead) => lead.temperature === "hot");
    const todayLead = userLeads[1];
    const draftLead = userLeads[2];
    return {
      text: `Based on your pipeline analysis, here's your priority list for today:\n\n1. 🔴 URGENT: Follow up with ${overdueLead?.name ?? "a lead"} at ${
        overdueLead?.company ?? "their company"
      } — overdue by 2 days\n2. 🟡 HIGH: Send proposal to ${
        negotiationLead?.name ?? "a lead"
      } at ${negotiationLead?.company ?? "their company"} — $${
        negotiationLead?.value.toLocaleString() ?? "45,000"
      } deal in negotiation\n3. 🟢 MEDIUM: Initial outreach to ${
        hotLead?.name ?? "a lead"
      } at ${hotLead?.company ?? "their company"} — new hot lead (score: ${
        hotLead?.score ?? 78
      })\n4. 📞 Call ${todayLead?.name ?? "a lead"} at ${
        todayLead?.company ?? "their company"
      } — scheduled follow-up today\n5. 📧 Review email draft for ${
        draftLead?.name ?? "a lead"
      } — AI agent prepared outreach`,
    };
  }

  if (
    lower.includes("stats") ||
    lower.includes("metrics") ||
    lower.includes("numbers") ||
    lower.includes("how am i doing")
  ) {
    const total = userLeads.length;
    const hot = userLeads.filter((lead) => lead.temperature === "hot").length;
    const won = userLeads.filter((lead) => lead.stage === "won").length;
    const conversion = total ? Math.round((won / total) * 100) : 0;
    return {
      text: `Here's your performance snapshot:\n\n• Total assigned leads: ${total}\n• Hot leads: ${hot}\n• Deals won: ${won}\n• Conversion rate: ${conversion}%`,
    };
  }

  return {
    text: `I can help you with lead briefings, email drafts, risk alerts, pipeline insights, and task prioritization. Here are some things you can try:\n\n• "Brief me on today's hot leads"\n• "Which leads are at risk?"\n• "Draft an email for [lead name]"\n• "What should I prioritize today?"\n• "Show me my stats"`,
  };
}

export function generateCopilotResponse(
  message: string,
  context: string,
  currentUser: User | null,
  leads: Lead[]
) {
  const lower = message.toLowerCase();
  const firstName = currentUser?.name.split(" ")[0] ?? "there";
  const now = new Date().toISOString();

  const hotLeads = leads.filter((lead) => lead.temperature === "hot");
  const atRisk = leads.filter((lead) => lead.riskFlag);

  const leadCard = (lead: Lead, content?: string) => ({
    id: `assistant-${Date.now()}`,
    role: "assistant" as const,
    content: content ?? "",
    type: "lead-card" as const,
    data: lead,
    timestamp: now,
  });

  const metricCard = (label: string, value: string, trend: "up" | "down") => ({
    id: `assistant-${Date.now()}`,
    role: "assistant" as const,
    content: "",
    type: "metric-card" as const,
    data: { label, value, trend },
    timestamp: now,
  });

  const emailDraft = (subject: string, body: string) => ({
    id: `assistant-${Date.now()}`,
    role: "assistant" as const,
    content: "",
    type: "email-draft" as const,
    data: { subject, body },
    timestamp: now,
  });

  const textResponse = (content: string) => ({
    id: `assistant-${Date.now()}`,
    role: "assistant" as const,
    content,
    type: "text" as const,
    timestamp: now,
  });

  if (context === "Dashboard") {
    if (lower.includes("leads") || lower.includes("total") || lower.includes("how many")) {
      return metricCard("Total Leads", `${leads.length}`, "up");
    }
    if (lower.includes("performance") || lower.includes("team")) {
      return textResponse(
        "Team performance looks strong this week. Rahul and Ananya are leading conversions, with Vikram close behind. Overall conversion rate is up 2.3%."
      );
    }
    if (lower.includes("agents") || lower.includes("status")) {
      return textResponse(
        "Agent status: 3 active, 2 idle. Risk Detector flagged 2 deals today, and Outreach Agent queued 4 follow-ups."
      );
    }
    if (lower.includes("source") || lower.includes("where")) {
      return textResponse(
        "Lead sources: LinkedIn (35%), Google Ads (25%), Webinar (20%), Referral (15%), Cold Outreach (5%)."
      );
    }
  }

  if (context === "Lead Emailing") {
    const lead = hotLeads[0] ?? leads[0];
    if (
      lower.includes("write") ||
      lower.includes("draft") ||
      lower.includes("email") ||
      lower.includes("compose")
    ) {
      return emailDraft(
        "Following Up on Our Discussion",
        `Hi ${lead?.name ?? "there"},\n\nI wanted to follow up on our recent conversation about ${lead?.company ?? "your team"}'s goals. Based on what you shared, I believe LeadPilot can help you drive faster follow-ups and higher conversion.\n\nWould Thursday at 3 PM work for a quick call?\n\nBest,\n${currentUser?.name ?? "LeadPilot Rep"}`
      );
    }
    if (lower.includes("subject")) {
      return textResponse(
        "Here are three subject line ideas:\n\n1. Following Up on Our Discussion\n2. Quick next steps for your pipeline\n3. Aligning on LeadPilot for Q2 goals"
      );
    }
    if (lower.includes("improve") || lower.includes("rewrite")) {
      return emailDraft(
        "Quick follow-up on pipeline priorities",
        `Hi ${lead?.name ?? "there"},\n\nJust wanted to share a tighter summary after our last conversation. We can help ${lead?.company ?? "your team"} speed up follow-ups and highlight high-intent leads automatically.\n\nIf you’re open to it, I can show you a short workflow demo this week.\n\nThanks,\n${currentUser?.name ?? "LeadPilot Rep"}`
      );
    }
    if (lower.includes("tone") || lower.includes("formal") || lower.includes("casual")) {
      return textResponse(
        "For a formal tone, lead with outcomes and timelines. For a casual tone, reference the last conversation and keep it conversational. I can rewrite a draft in either style."
      );
    }
    if (lower.includes("follow up") || lower.includes("follow-up")) {
      return emailDraft(
        "Checking in on next steps",
        `Hi ${lead?.name ?? "there"},\n\nJust checking in on next steps for ${lead?.company ?? "your team"}. Happy to answer any questions or share a quick ROI snapshot if helpful.\n\nLet me know what works best.\n\nBest,\n${currentUser?.name ?? "LeadPilot Rep"}`
      );
    }
  }

  if (context === "Lead Calling") {
    if (lower.includes("script") || lower.includes("talk") || lower.includes("say")) {
      return textResponse(
        "Call script outline:\n\n• Open with a quick recap of their goal\n• Mention 1-2 quick wins LeadPilot delivers\n• Ask for feedback and confirm next steps\n• Close with a clear meeting slot"
      );
    }
    if (lower.includes("objection") || lower.includes("pushback") || lower.includes("handle")) {
      return textResponse(
        "Objection handling:\n\n• Too expensive → Offer ROI calculator\n• Need to think → Suggest a short pilot\n• Already using competitor → Highlight speed-to-value"
      );
    }
    if (lower.includes("prep") || lower.includes("prepare") || lower.includes("before call")) {
      return textResponse(
        `Pre-call summary for ${hotLeads[0]?.name ?? "your top lead"}: recent activity shows interest in automation, and they opened the last two emails. Focus on lead routing speed and follow-up consistency.`
      );
    }
  }

  if (context === "Pipeline Review") {
    if (lower.includes("stuck") || lower.includes("bottleneck") || lower.includes("slow")) {
      return textResponse(
        "Stuck deals: two leads in negotiation for 14+ days and three leads in proposal for 10+ days. Recommend immediate follow-up and timeline confirmation."
      );
    }
    if (lower.includes("forecast") || lower.includes("predict") || lower.includes("revenue")) {
      return metricCard("Forecast", "$420k", "up");
    }
    if (lower.includes("move") || lower.includes("advance")) {
      return textResponse(
        "Move forward: prioritize lead reviews for your highest scoring qualified leads and advance any proposals missing next steps."
      );
    }
  }

  if (context === "Lead Research") {
    if (lower.includes("research") || lower.includes("tell me about") || lower.includes("company")) {
      return textResponse(
        "Company overview: growth-mode SaaS with recent hiring in RevOps. High intent signals from recent webinar attendance and content downloads."
      );
    }
    if (lower.includes("competitor") || lower.includes("using what")) {
      return textResponse(
        "Competitive intel: currently using LeadOpsX. Contract ends in Q2 2026. Key pain points around reporting and response speed."
      );
    }
    if (lower.includes("news") || lower.includes("recent")) {
      return textResponse(
        "Recent news: announced expansion into APAC and launched a new AI product line in the last 30 days."
      );
    }
  }

  if (context === "Follow-up Queue") {
    if (lower.includes("overdue") || lower.includes("missed") || lower.includes("late")) {
      return textResponse(
        `Overdue follow-ups: ${atRisk.length} leads are late. Prioritize the ones with the highest value and score.`
      );
    }
    if (lower.includes("today") || lower.includes("do today") || lower.includes("plan")) {
      return textResponse(
        "Today's plan:\n\n1. Follow up with your hottest lead\n2. Send the pending proposal in negotiation\n3. Call two overdue leads"
      );
    }
    if (lower.includes("snooze") || lower.includes("postpone") || lower.includes("later")) {
      return textResponse(
        "Snoozed for tomorrow. Consider sending a quick check-in email so they stay warm."
      );
    }
  }

  if (lower.includes("hot leads") || lower.includes("best leads") || lower.includes("top")) {
    const hotList = hotLeads.slice(0, 5);
    const text = `Top hot leads:\n\n${hotList
      .map(
        (lead) =>
          `🔥 ${lead.name} at ${lead.company} — Score ${lead.score}/100 — $${lead.value.toLocaleString()}`
      )
      .join("\n")}`;
    return hotList[0] ? leadCard(hotList[0], text) : textResponse(text);
  }

  if (lower.includes("at risk") || lower.includes("risk") || lower.includes("danger") || lower.includes("losing")) {
    const riskList = atRisk.slice(0, 4);
    const text = `At-risk leads:\n\n${riskList
      .map(
        (lead) =>
          `⚠️ ${lead.name} at ${lead.company} — ${lead.riskReason ?? "Needs attention"}`
      )
      .join("\n")}`;
    return riskList[0] ? leadCard(riskList[0], text) : textResponse(text);
  }

  if (lower.includes("stats") || lower.includes("metrics") || lower.includes("numbers") || lower.includes("kpi")) {
    return metricCard("Hot Leads", `${hotLeads.length}`, "up");
  }

  if (lower.includes("brief") || lower.includes("briefing") || lower.includes("summary")) {
    return textResponse(
      `Here’s your briefing, ${firstName}:\n\n🔥 ${hotLeads.length} hot leads need attention\n⚠️ ${atRisk.length} at-risk deals\n✅ Follow-ups due today: ${leads.filter((lead) => lead.nextFollowUp <= new Date().toISOString()).length}`
    );
  }

  if (lower.includes("prioritize") || lower.includes("priority") || lower.includes("what should") || lower.includes("plan")) {
    return textResponse(
      "Priority list:\n\n1. Follow up with the hottest lead in negotiation\n2. Schedule demos for qualified leads\n3. Clear overdue follow-ups"
    );
  }

  if (lower.includes("help") || lower.includes("what can you")) {
    return textResponse(
      "I can help with hot lead summaries, at-risk alerts, drafting emails, call prep, pipeline forecasts, and daily priorities. Try asking about your hot leads or say 'stats'."
    );
  }

  return textResponse(
    `I'm here to help! In **${context}** mode, I can assist with context-specific insights. Try asking about your hot leads, pipeline risks, or say "help" for more options.`
  );
}
