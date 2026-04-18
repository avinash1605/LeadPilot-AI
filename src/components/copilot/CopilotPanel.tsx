"use client";

import {
  BarChart3,
  Briefcase,
  HelpCircle,
  Mail,
  Mic,
  Phone,
  Send,
  Sparkles,
  X,
  AlertTriangle,
  ArrowUp,
  Volume2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useCopilotStore } from "@/lib/store/copilot-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useLeadStore } from "@/lib/store/lead-store";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useVoiceStore } from "@/lib/store/voice-store";
import { voiceConfig } from "@/lib/voice-config";
import { VoiceWaveform } from "@/components/copilot/voice-waveform";
import { VoiceBadge } from "@/components/copilot/voice-badge";
import { cn } from "@/lib/utils";

interface CopilotPanelProps {
  isOverlay: boolean;
  isFullScreen?: boolean;
  onClose: () => void;
}

const slashCommands = [
  { command: "/brief", description: "Get today's briefing", icon: Briefcase },
  { command: "/risk", description: "Show at-risk leads", icon: AlertTriangle },
  { command: "/email", description: "Draft an email", icon: Mail },
  { command: "/call", description: "Get call script", icon: Phone },
  { command: "/stats", description: "Show key metrics", icon: BarChart3 },
  { command: "/help", description: "What can I do?", icon: HelpCircle },
];

export function CopilotPanel({
  isOverlay,
  isFullScreen = false,
  onClose,
}: CopilotPanelProps) {
  const {
    messages,
    isTyping,
    currentContext,
    isOpen,
    sendMessage,
    clearChat,
    setOpen,
  } = useCopilotStore();
  const { voiceMode, isVoiceEnabled, setVoiceMode, setTranscript, toggleVoiceEnabled, reset } =
    useVoiceStore();
  const { startListening, stopListening, transcript, isListening, error } =
    useSpeechToText();
  const { speak, stop, isSpeaking } = useTextToSpeech();
  const currentUser = useAuthStore((state) => state.currentUser);
  const getLeadsForUser = useLeadStore((state) => state.getLeadsForUser);
  const userLeads = useMemo(() => {
    if (!currentUser) return [];
    return getLeadsForUser(currentUser.id);
  }, [currentUser, getLeadsForUser]);
  const [input, setInput] = useState("");
  const [showSlash, setShowSlash] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isVoiceEnabled) return;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return;
    if (!lastMessage.content) return;
    if (!voiceConfig.isBrowserTTSAvailable()) return;
    setVoiceMode("speaking");
    speak(lastMessage.content).finally(() => setVoiceMode("idle"));
  }, [isVoiceEnabled, messages, setVoiceMode, speak]);

  useEffect(() => {
    if (isVoiceEnabled) return;
    if (voiceMode !== "processing") return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant") {
      setVoiceMode("idle");
    }
  }, [isVoiceEnabled, messages, setVoiceMode, voiceMode]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const filteredCommands = useMemo(() => {
    if (!input.startsWith("/")) return slashCommands;
    const term = input.replace("/", "").toLowerCase();
    return slashCommands.filter((item) =>
      item.command.includes(term)
    );
  }, [input]);

  const placeholder = useMemo(() => {
    if (currentContext === "Dashboard") return "Ask about your pipeline...";
    if (currentContext === "Lead Emailing") return "Need help drafting an email?";
    if (currentContext === "Lead Calling") return "Ask for call prep help...";
    if (currentContext === "Pipeline") return "Ask about pipeline insights...";
    return "Ask your AI copilot...";
  }, [currentContext]);

  const lastAssistantId = useMemo(() => {
    const last = [...messages].reverse().find((msg) => msg.role === "assistant");
    return last?.id ?? null;
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    sendMessage(text.trim(), currentUser, userLeads);
    setInput("");
    setShowSlash(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (showSlash && filteredCommands.length > 0) {
        handleSend(filteredCommands[0].command);
        return;
      }
      handleSend(input);
    }
    if (event.key === "Escape") {
      setShowSlash(false);
    }
  };

  const handleVoice = () => {
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
    if (isListening) {
      setTranscript(transcript);
    }
  }, [isListening, setTranscript, transcript]);

  useEffect(() => {
    if (!isListening && transcript && voiceMode === "listening") {
      setVoiceMode("processing");
      handleSend(transcript);
      reset();
    }
  }, [handleSend, isListening, reset, transcript, voiceMode]);

  useEffect(() => {
    if (!isListening && !transcript && voiceMode === "listening") {
      setVoiceMode("idle");
    }
  }, [isListening, transcript, voiceMode, setVoiceMode]);

  const renderText = (text: string) => {
    const lines = text.split("\n");
    return (
      <div className="space-y-2">
        {lines.map((line, index) => {
          const isList = /^\s*[\d•-]/.test(line) || /^\p{Extended_Pictographic}/u.test(line);
          const parts = line.split(/(\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\b)/g);
          return (
            <p
              key={`${line}-${index}`}
              className={cn(
                "text-sm leading-relaxed",
                isList ? "text-zinc-200" : "text-zinc-100"
              )}
            >
              {parts.map((part, partIndex) => {
                if (/^[A-Z][a-z]+(?:\s[A-Z][a-z]+)?$/.test(part)) {
                  return (
                    <span
                      key={`${part}-${partIndex}`}
                      className="rounded bg-indigo-500/10 px-1 text-xs text-indigo-400"
                    >
                      {part}
                    </span>
                  );
                }
                return <span key={`${part}-${partIndex}`}>{part}</span>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.aside
          key="copilot-panel"
          initial={{ x: 360, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 360, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className={cn(
            "flex h-full flex-col border-l border-zinc-800 bg-zinc-900",
            isFullScreen ? "w-full" : "w-[360px]",
            isOverlay ? "fixed right-0 top-0 z-50" : "flex-shrink-0"
          )}
        >
          <div className="flex h-14 items-center justify-between border-b border-zinc-800 px-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">AI Copilot</span>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                {currentContext}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-500">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Live
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleVoiceEnabled}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]",
                  isVoiceEnabled
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "bg-zinc-800 text-zinc-500"
                )}
              >
                <Volume2 size={12} />
                Voice replies
              </button>
              <VoiceBadge useElevenLabs={voiceConfig.isElevenLabsAvailable()} />
              <button
                type="button"
                onClick={clearChat}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onClose();
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="custom-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Sparkles size={48} className="text-indigo-500/20" />
                <p className="mt-3 text-base font-medium text-zinc-400">
                  Your AI Copilot
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  Ask me anything about your leads, pipeline, or tasks.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {["📊 Quick stats", "🔥 Hot leads", "⚠️ At-risk leads"].map(
                    (chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleSend(chip)}
                        className="rounded-full bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 transition hover:bg-zinc-700 hover:text-zinc-300"
                      >
                        {chip}
                      </button>
                    )
                  )}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  if (message.type === "lead-card" && message.data) {
                    const lead = message.data;
                    return (
                      <div key={message.id} className="space-y-3">
                        {message.content ? (
                          <div className="rounded-2xl rounded-bl-sm border border-zinc-700 bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-100">
                            {renderText(message.content)}
                          </div>
                        ) : null}
                        <div className="rounded-xl border border-zinc-700 bg-zinc-800/80 p-3">
                          <p className="text-sm font-medium text-white">{lead.name}</p>
                          <p className="text-xs text-zinc-400">{lead.company}</p>
                          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
                            <span className="rounded-full bg-zinc-700 px-2 py-0.5">
                              Score {lead.score}
                            </span>
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                lead.temperature === "hot"
                                  ? "bg-red-400"
                                  : lead.temperature === "warm"
                                  ? "bg-amber-400"
                                  : "bg-blue-400"
                              )}
                            />
                            <span>${lead.value.toLocaleString()}</span>
                          </div>
                          <button className="mt-2 text-xs text-indigo-400">
                            View Lead →
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (message.type === "metric-card" && message.data) {
                    const metric = message.data;
                    return (
                      <div key={message.id} className="rounded-xl border border-zinc-700 bg-zinc-800/80 p-3">
                        <p className="text-lg font-bold text-white">{metric.value}</p>
                        <p className="text-xs text-zinc-400">{metric.label}</p>
                        <div
                          className={cn(
                            "mt-1 flex items-center gap-1 text-xs",
                            metric.trend === "down" ? "text-red-400" : "text-green-500"
                          )}
                        >
                          <ArrowUp size={12} />
                          {metric.trend}
                        </div>
                      </div>
                    );
                  }

                  if (message.type === "email-draft" && message.data) {
                    return (
                      <div key={message.id} className="rounded-xl border border-zinc-700 bg-zinc-800/80 p-3">
                        <p className="text-sm font-medium text-white">
                          Subject: {message.data.subject}
                        </p>
                        <div className="my-2 h-px bg-zinc-700" />
                        <p className="text-xs text-zinc-300 line-clamp-4">
                          {message.data.body}
                        </p>
                        <button className="mt-2 text-xs text-indigo-400">
                          Use this draft →
                        </button>
                      </div>
                    );
                  }

                  if (message.type === "action-card" && message.data) {
                    return (
                      <div
                        key={message.id}
                        className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3"
                      >
                        <p className="text-sm text-zinc-200">
                          {message.data.text}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            toast.info("Action triggered");
                          }}
                          className="mt-3 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs text-white"
                        >
                          {message.data.action}
                        </button>
                      </div>
                    );
                  }

                  if (message.type === "action-card" && message.data) {
                    return (
                      <div
                        key={message.id}
                        className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3"
                      >
                        <p className="text-sm text-zinc-200">
                          {message.data.text}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            toast.info("Action triggered");
                          }}
                          className="mt-3 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs text-white"
                        >
                          {message.data.action}
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm",
                          message.role === "user"
                            ? "rounded-br-sm bg-indigo-600 text-white"
                            : "rounded-bl-sm border border-zinc-700 bg-zinc-800 text-zinc-100"
                        )}
                      >
                        {message.role === "assistant" ? (
                          <div className="mb-1 flex items-center gap-1 text-[10px] text-indigo-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                            LeadPilot AI
                            {isSpeaking && message.id === lastAssistantId ? (
                              <VoiceWaveform active />
                            ) : null}
                          </div>
                        ) : null}
                        {renderText(message.content)}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {isTyping ? (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-zinc-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="typing-dot h-1.5 w-1.5 rounded-full bg-zinc-400"
                        style={{ animationDelay: `${dot * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>

          <div className="relative border-t border-zinc-800 p-3">
            {showSlash ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-16 left-3 right-3 rounded-xl border border-zinc-700 bg-zinc-800 shadow-xl"
              >
                {filteredCommands.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.command}
                      type="button"
                      onClick={() => handleSend(item.command)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-zinc-700"
                    >
                      <Icon size={16} className="text-zinc-400" />
                      <div>
                        <p className="text-sm font-medium text-zinc-200">
                          {item.command}
                        </p>
                        <p className="text-xs text-zinc-500">{item.description}</p>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            ) : null}

            {voiceMode === "listening" ? (
              <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-300">
                <VoiceWaveform active />
                <span>{transcript || "Listening..."}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  data-copilot-input
                  value={input}
                  onChange={(event) => {
                    setInput(event.target.value);
                    setShowSlash(event.target.value.startsWith("/"));
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-indigo-500/50 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleVoice}
                  disabled={!voiceConfig.isBrowserSpeechAvailable()}
                  title={
                    voiceConfig.isBrowserSpeechAvailable()
                      ? "Start voice input"
                      : "Voice not supported in this browser"
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:bg-indigo-500/20 hover:text-indigo-400 disabled:cursor-not-allowed disabled:text-zinc-600"
                >
                  <Mic size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleSend(input)}
                  disabled={!input.trim()}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl",
                    input.trim()
                      ? "bg-indigo-600 text-white hover:bg-indigo-500"
                      : "bg-zinc-800 text-zinc-600"
                  )}
                >
                  <Send size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="sr-only" aria-live="polite" />
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
