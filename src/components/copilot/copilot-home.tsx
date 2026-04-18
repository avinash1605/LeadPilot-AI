"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Mic } from "lucide-react";
import { isBefore, isToday, parseISO } from "date-fns";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/auth-store";
import { useLeadStore } from "@/lib/store/lead-store";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useVoiceStore } from "@/lib/store/voice-store";
import { voiceConfig } from "@/lib/voice-config";
import { VoiceOrb } from "@/components/copilot/voice-orb";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/lib/store/ui-store";
import { focusModes } from "@/lib/mock-data/focus-modes";
import { useRouter } from "next/navigation";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const defaultChips = [
  "Brief me on today's hot leads",
  "Which leads are at risk?",
  "Draft a follow-up email for Acme Corp",
  "What should I prioritize today?",
];

const focusChips: Record<string, string[]> = {
  "lead-emailing": [
    "Draft an email for my hottest lead",
    "Show me email open rates",
    "Suggest subject lines",
  ],
  "lead-calling": ["Prep me for my next call", "Show call scripts", "Who should I call first?"],
  "pipeline-review": [
    "Show stalled deals",
    "Pipeline forecast",
    "Which leads should I advance?",
  ],
  "lead-research": [
    "Research Acme Corp",
    "Find competitive intel",
    "Who are the key contacts?",
  ],
  "follow-up-queue": ["What's overdue?", "Plan my follow-ups", "Snooze everything to tomorrow"],
};

export function CopilotHome() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const leads = useLeadStore((state) => state.leads);
  const activeFocusMode = useUiStore((state) => state.activeFocusMode);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const { startListening, stopListening, transcript, isListening, error } =
    useSpeechToText();
  const { speak, stop } = useTextToSpeech();
  const { voiceMode, setVoiceMode, setTranscript, reset } = useVoiceStore();

  const firstName = currentUser?.name.split(" ")[0] ?? "there";
  const userLeads = leads.filter((lead) => lead.assignedTo === currentUser?.id);
  const hotCount = userLeads.filter((lead) => lead.temperature === "hot").length;
  const followUpCount = userLeads.filter((lead) => {
    const date = parseISO(lead.nextFollowUp);
    return isToday(date) || isBefore(date, new Date());
  }).length;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const base =
      hour < 12
        ? `Good morning, ${firstName} 👋`
        : hour < 17
        ? `Good afternoon, ${firstName} 👋`
        : `Good evening, ${firstName} 👋`;
    const focusLabel = focusModes.find((mode) => mode.id === activeFocusMode)?.name;
    return focusLabel ? `${base} — Focus: ${focusLabel}` : base;
  }, [activeFocusMode, firstName]);

  const chips = useMemo(() => {
    if (activeFocusMode && focusChips[activeFocusMode]) {
      return focusChips[activeFocusMode];
    }
    return defaultChips;
  }, [activeFocusMode]);

  const activeMode = focusModes.find((mode) => mode.id === activeFocusMode);

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  const handleSend = async (text: string, shouldSpeak = false) => {
    if (!text.trim()) return;
    const prompt = text.trim();
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: prompt,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/copilot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          context: activeMode?.name ?? "Lead Management",
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error ?? "Copilot service error");
      }
      const data = await response.json();
      const answer = data.response || "No response available.";
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: answer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      if (shouldSpeak && voiceConfig.isBrowserTTSAvailable()) {
        setVoiceMode("speaking");
        speak(answer).finally(() => setVoiceMode("idle"));
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: "Unable to reach the copilot service. Please try again.",
        },
      ]);
      toast.error(
        err instanceof Error ? err.message : "Unable to reach the copilot service."
      );
    } finally {
      setIsTyping(false);
      setTimeout(scrollToBottom, 50);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend(input);
    }
  };

  const handleVoiceClick = () => {
    if (!voiceConfig.isBrowserSpeechAvailable()) {
      toast.error("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    if (voiceMode === "speaking") {
      stop();
    }
    if (voiceMode === "listening") {
      stopListening();
      setVoiceMode("processing");
      return;
    }
    setVoiceMode("listening");
    startListening();
  };

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (isListening) {
      setTranscript(transcript);
    }
  }, [isListening, setTranscript, transcript]);

  useEffect(() => {
    if (!isListening && transcript && voiceMode === "listening") {
      setVoiceMode("processing");
      handleSend(transcript, true);
      reset();
    }
  }, [handleSend, isListening, reset, transcript, voiceMode]);

  useEffect(() => {
    if (!isListening && !transcript && voiceMode === "listening") {
      setVoiceMode("idle");
    }
  }, [isListening, transcript, voiceMode, setVoiceMode]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col gap-6 overflow-hidden">
      <div className="absolute left-1/2 top-20 -z-10 -translate-x-1/2">
        <div className={cn("orb", voiceMode !== "idle" && "opacity-60")} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-white">{greeting}</h2>
          {messages.length > 0 ? (
            <button
              type="button"
              onClick={() => setMessages([])}
              className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
            >
              Back to start
            </button>
          ) : null}
        </div>
        <p className="mt-2 text-base text-zinc-400">
          You have {hotCount} hot leads today. {followUpCount} need follow-up by
          EOD.
        </p>
      </motion.div>

      <div className="relative flex w-full min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref={chatRef}
          className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto pb-2"
        >
          {messages.length === 0 ? (
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                Try asking
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {chips.map((chip, index) => (
                  <motion.button
                    key={chip}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    onClick={() => handleSend(chip)}
                    className="rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-700/60 hover:text-white"
                  >
                    {chip}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                      message.role === "user"
                        ? "rounded-br-md bg-indigo-600 text-white"
                        : "rounded-bl-md border border-zinc-700 bg-zinc-800 text-zinc-100"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <div className="mb-1 flex items-center gap-2 text-xs text-indigo-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                        LeadPilot AI
                      </div>
                    ) : null}
                    <ResponseText text={message.text} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="rounded-2xl rounded-bl-md border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-zinc-100">
                  <div className="mb-1 flex items-center gap-2 text-xs text-indigo-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    LeadPilot AI
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-500" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-500" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-500" />
                  </div>
                </div>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {voiceMode !== "idle" ? (
          <span className="w-fit rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-400">
            {voiceMode === "listening"
              ? "🎙️ Listening..."
              : voiceMode === "processing"
              ? "⏳ Processing..."
              : "🔊 Speaking..."}
          </span>
        ) : null}
        <div className="flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-800 p-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your AI copilot anything..."
            rows={1}
            className="flex-1 resize-none bg-transparent px-3 py-2 text-base text-white placeholder:text-zinc-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleVoiceClick}
            disabled={!voiceConfig.isBrowserSpeechAvailable()}
            title={
              voiceConfig.isBrowserSpeechAvailable()
                ? "Start voice input"
                : "Voice not supported in this browser"
            }
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-700 text-zinc-400 transition hover:bg-indigo-600/20 hover:text-indigo-400 disabled:cursor-not-allowed disabled:text-zinc-600"
          >
            <span className="absolute inset-0 rounded-xl opacity-0 transition group-hover:opacity-100 group-hover:ring-2 group-hover:ring-indigo-500/40" />
            <Mic size={18} />
          </button>
          <button
            type="button"
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition",
              input.trim()
                ? "bg-indigo-600 text-white hover:bg-indigo-500"
                : "bg-zinc-700 text-zinc-500"
            )}
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>

      {activeMode ? (
        <div
          className={cn(
            "flex items-center justify-between rounded-xl border px-4 py-2 text-sm",
            {
              indigo: "border-indigo-500/20 bg-indigo-500/5 text-indigo-200",
              emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-200",
              amber: "border-amber-500/20 bg-amber-500/5 text-amber-200",
              violet: "border-violet-500/20 bg-violet-500/5 text-violet-200",
              rose: "border-rose-500/20 bg-rose-500/5 text-rose-200",
            }[activeMode.color]
          )}
        >
          <span>
            📌 {activeMode.name} focus active — {activeMode.description}
          </span>
          <button
            type="button"
            onClick={() => router.push(`/user/focus/${activeMode.id}`)}
            className="text-xs text-indigo-300 hover:text-indigo-200"
          >
            Open full view →
          </button>
        </div>
      ) : null}
      <div className="sr-only" aria-live="polite" />
    </div>
  );
}

function ResponseText({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        if (line.trim() === "---") {
          return <hr key={`hr-${index}`} className="border-zinc-700" />;
        }

        const isListItem = /^•\s/.test(line) || /^\d+\./.test(line);
        const trimmed = line.trim();
        const isEmoji =
          trimmed.length > 0 && (trimmed.codePointAt(0) ?? 0) > 0x1f000;

        return (
          <p
            key={`${line}-${index}`}
            className={cn(
              "whitespace-pre-wrap text-sm",
              isListItem || isEmoji ? "text-zinc-200" : "text-zinc-100"
            )}
          >
            {line}
          </p>
        );
      })}
    </div>
  );
}
