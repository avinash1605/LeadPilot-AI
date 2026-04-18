import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCopilotStore } from "@/lib/store/copilot-store";
import { useUiStore } from "@/lib/store/ui-store";
import { focusModes } from "@/lib/mock-data/focus-modes";

const contextMap: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/leads": "Leads Management",
  "/admin/agents": "Agent Orchestration",
  "/admin/pipeline": "Pipeline",
  "/admin/team": "Team",
  "/user": "Home",
  "/user/focus/lead-emailing": "Lead Emailing",
  "/user/focus/lead-calling": "Lead Calling",
  "/user/focus/pipeline-review": "Pipeline Review",
  "/user/focus/lead-research": "Lead Research",
  "/user/focus/follow-up-queue": "Follow-up Queue",
  "/user/agents": "Agent Orchestration",
};

export function useCopilotContext() {
  const pathname = usePathname();
  const setContext = useCopilotStore((state) => state.setContext);
  const activeFocusMode = useUiStore((state) => state.activeFocusMode);

  useEffect(() => {
    const focusLabel = focusModes.find((mode) => mode.id === activeFocusMode)?.name;
    const context =
      focusLabel ??
      contextMap[pathname] ??
      "Dashboard";
    setContext(context);
  }, [activeFocusMode, pathname, setContext]);
}
