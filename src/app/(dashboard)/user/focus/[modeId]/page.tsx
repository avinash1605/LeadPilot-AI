"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, KanbanSquare, Mail, Phone, Search } from "lucide-react";
import { focusModes } from "@/lib/mock-data/focus-modes";
import { EmailMode } from "@/components/focus/email-mode";
import { CallMode } from "@/components/focus/call-mode";
import { PipelineMode } from "@/components/focus/pipeline-mode";
import { ResearchMode } from "@/components/focus/research-mode";
import { FollowUpMode } from "@/components/focus/followup-mode";

const iconMap = {
  Mail,
  Phone,
  KanbanSquare,
  Search,
  Clock,
};

const componentMap = {
  "lead-emailing": EmailMode,
  "lead-calling": CallMode,
  "pipeline-review": PipelineMode,
  "lead-research": ResearchMode,
  "follow-up-queue": FollowUpMode,
};

interface FocusModePageProps {
  params: { modeId: string };
}

export default function FocusModePage({ params }: FocusModePageProps) {
  const mode = focusModes.find((item) => item.id === params.modeId);
  const ModeComponent =
    componentMap[params.modeId as keyof typeof componentMap];
  const Icon = mode ? iconMap[mode.icon as keyof typeof iconMap] : null;

  if (!mode || !ModeComponent) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="text-xl text-white">Focus mode not found</p>
        <Link
          href="/user"
          className="mt-4 rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="space-y-3">
        <Link
          href="/user"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
            {Icon ? <Icon size={18} /> : null}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">{mode.name}</h1>
            <p className="text-sm text-zinc-400">{mode.description}</p>
          </div>
          <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
            Powered by AI Focus Mode
          </span>
        </div>
      </div>
      <div className="border-b border-zinc-800" />
      <ModeComponent />
    </motion.div>
  );
}
