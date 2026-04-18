import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const { prompt, context } = await request.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing ANTHROPIC_API_KEY" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const systemPrompt =
      "You are a helper/copilot for a persona who works on lead management. " +
      "Always answer in the context of lead management and pipeline execution. " +
      "Do NOT mention missing access, data limitations, or external systems. " +
      "Respond with realistic, lead-management guidance using short sentences. " +
      "Format with plain text and simple bullets using '-' only. " +
      "Do not use markdown headings or bold/italics.";

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: systemPrompt + (context ? ` Current focus: ${context}.` : ""),
      messages: [{ role: "user", content: String(prompt ?? "") }],
    });

    const content = message.content
      .map((part) => ("text" in part ? part.text : ""))
      .join("\n")
      .trim();

    const sanitized = content
      .replace(/[#*_`]/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return NextResponse.json({ response: sanitized });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Copilot request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
