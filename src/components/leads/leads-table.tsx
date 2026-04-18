"use client";

import { memo, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRightCircle,
  Eye,
  Link,
  Mail,
  MoreHorizontal,
  SearchX,
  Target,
  Trash2,
  UserPlus,
  Users,
  Video,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { Lead } from "@/lib/types";
import { users } from "@/lib/mock-data/users";
import { cn } from "@/lib/utils";
import { useLeadStore } from "@/lib/store/lead-store";
import { EmptyState } from "@/components/ui/empty-state";

const stageColors: Record<Lead["stage"], string> = {
  new: "bg-blue-500/10 text-blue-400",
  contacted: "bg-indigo-500/10 text-indigo-400",
  qualified: "bg-violet-500/10 text-violet-400",
  proposal: "bg-purple-500/10 text-purple-400",
  negotiation: "bg-amber-500/10 text-amber-400",
  won: "bg-green-500/10 text-green-400",
  lost: "bg-red-500/10 text-red-400",
  cold: "bg-zinc-500/10 text-zinc-400",
};

const sourceIcons: Record<Lead["source"], JSX.Element> = {
  linkedin: <Link size={14} className="text-blue-400" />,
  google_ads: <Target size={14} className="text-green-400" />,
  webinar: <Video size={14} className="text-purple-400" />,
  referral: <Users size={14} className="text-amber-400" />,
  cold_outreach: <Mail size={14} className="text-zinc-400" />,
};

const stageOptions: Lead["stage"][] = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
  "cold",
];

const reps = users.filter((user) => user.role === "user");

interface LeadsTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  selectedLeadId?: string | null;
}

export function LeadsTable({ leads, onSelectLead, selectedLeadId }: LeadsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [menuLeadId, setMenuLeadId] = useState<string | null>(null);
  const [submenu, setSubmenu] = useState<"stage" | "assign" | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const clearFilters = useLeadStore((state) => state.clearFilters);

  useEffect(() => {
    const handler = () => {
      setMenuLeadId(null);
      setSubmenu(null);
    };
    if (menuLeadId) {
      window.addEventListener("click", handler);
    }
    return () => window.removeEventListener("click", handler);
  }, [menuLeadId]);

  const toggleSelectAll = () => {
    if (selectedIds.length === leads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map((lead) => lead.id));
    }
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToast = (message: string) => {
    toast.info(message);
    setToastMessage(message);
  };

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-16 text-center">
        <EmptyState
          icon={SearchX}
          title="No leads match your filters"
          description="Try broadening your search"
          action={{ label: "Clear filters", onClick: clearFilters }}
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="custom-scrollbar max-h-[600px] overflow-auto">
        <table className="w-full min-w-[980px] text-left">
          <thead className="sticky top-0 bg-zinc-800/50 text-xs uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.length === leads.length}
                  onChange={toggleSelectAll}
                  className="accent-indigo-500 transition-all duration-200 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]"
                />
              </th>
              <th className="px-4 py-3">Name & Company</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3 text-center">Score</th>
              <th className="px-4 py-3 text-center">Temp</th>
              <th className="px-4 py-3">Assigned</th>
              <th className="px-4 py-3 text-right">Deal Value</th>
              <th className="px-4 py-3">Last Activity</th>
              <th className="px-4 py-3 text-center">Risk</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-zinc-300">
            {leads.map((lead, index) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                index={index}
                isSelected={selectedLeadId === lead.id}
                isChecked={selectedIds.includes(lead.id)}
                onSelect={() => onSelectLead(lead)}
                onToggleCheckbox={() => toggleRow(lead.id)}
                onToggleMenu={() =>
                  setMenuLeadId(menuLeadId === lead.id ? null : lead.id)
                }
                menuOpen={menuLeadId === lead.id}
                submenu={submenu}
                onToggleSubmenu={setSubmenu}
                onToast={handleToast}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-3 text-xs text-zinc-500">
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 ? (
            <>
              <span>{selectedIds.length} leads selected</span>
              <button
                type="button"
                onClick={() => handleToast("Bulk reassign (demo)")}
                className="rounded-lg bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300"
              >
                Bulk Reassign
              </button>
              <button
                type="button"
                onClick={() => handleToast("Bulk stage change (demo)")}
                className="rounded-lg bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300"
              >
                Bulk Stage Change
              </button>
            </>
          ) : (
            <span>No leads selected</span>
          )}
        </div>
        <span>Showing 1-{leads.length} of {leads.length}</span>
      </div>

      <div className="sr-only" aria-live="polite">
        {toastMessage}
      </div>
    </div>
  );
}

interface LeadRowProps {
  lead: Lead;
  index: number;
  isSelected: boolean;
  isChecked: boolean;
  menuOpen: boolean;
  submenu: "stage" | "assign" | null;
  onSelect: () => void;
  onToggleCheckbox: () => void;
  onToggleMenu: () => void;
  onToggleSubmenu: (value: "stage" | "assign" | null) => void;
  onToast: (message: string) => void;
}

const LeadRow = memo(function LeadRow({
  lead,
  index,
  isSelected,
  isChecked,
  menuOpen,
  submenu,
  onSelect,
  onToggleCheckbox,
  onToggleMenu,
  onToggleSubmenu,
  onToast,
}: LeadRowProps) {
  const assigned = reps.find((rep) => rep.id === lead.assignedTo);
  const scoreClass =
    lead.score > 70
      ? "bg-green-500/10 text-green-400"
      : lead.score >= 40
      ? "bg-amber-500/10 text-amber-400"
      : "bg-red-500/10 text-red-400";
  const tempColor =
    lead.temperature === "hot"
      ? "bg-red-400"
      : lead.temperature === "warm"
      ? "bg-amber-400"
      : "bg-blue-400";

  return (
    <tr
      className={cn(
        "cursor-pointer border-b border-zinc-800/50 transition hover:bg-zinc-800/40",
        index % 2 === 1 && "bg-zinc-800/20",
        isSelected && "border-l-2 border-indigo-500 bg-indigo-500/5"
      )}
      onClick={onSelect}
    >
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(event) => {
            event.stopPropagation();
            onToggleCheckbox();
          }}
          className="accent-indigo-500 transition-all duration-200 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]"
        />
      </td>
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-white">{lead.name}</p>
        <p className="text-xs text-zinc-400">{lead.company}</p>
      </td>
      <td className="px-4 py-3 text-xs text-zinc-400">
        <div className="flex items-center gap-1">
          {sourceIcons[lead.source]}
          {lead.source.replace("_", " ")}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`rounded-full px-2 py-0.5 text-xs ${stageColors[lead.stage]}`}>
          {lead.stage}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs",
            scoreClass,
            lead.score > 80 && "score-pulse"
          )}
        >
          {lead.score}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span
          title={lead.temperature}
          className={`mx-auto block h-2.5 w-2.5 rounded-full ${tempColor}`}
        />
      </td>
      <td className="px-4 py-3 text-xs text-zinc-300">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-[10px] text-white">
            {assigned?.name
              .split(" ")
              .map((part) => part[0])
              .join("")}
          </div>
          {assigned?.name.split(" ")[0]}
        </div>
      </td>
      <td className="px-4 py-3 text-right text-sm text-zinc-200">
        ${lead.value.toLocaleString()}
      </td>
      <td className="px-4 py-3 text-xs text-zinc-500">
        {formatDistanceToNow(new Date(lead.lastActivityAt), { addSuffix: true })}
      </td>
      <td className="px-4 py-3 text-center">
        {lead.riskFlag ? (
          <AlertTriangle size={16} className="mx-auto text-red-400" title={lead.riskReason} />
        ) : (
          <span className="text-zinc-600">—</span>
        )}
      </td>
      <td className="relative px-4 py-3 text-center">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleMenu();
          }}
          className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800"
        >
          <MoreHorizontal size={16} />
        </button>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-2 z-20 mt-2 w-[180px] rounded-xl border border-zinc-700 bg-zinc-800 py-1 text-left text-sm text-zinc-200 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={onSelect}
              className="flex w-full items-center gap-2 px-3 py-2 hover:bg-zinc-700"
            >
              <Eye size={14} />
              View Details
            </button>
            <button
              type="button"
              onClick={() => onToggleSubmenu(submenu === "stage" ? null : "stage")}
              className="flex w-full items-center gap-2 px-3 py-2 hover:bg-zinc-700"
            >
              <ArrowRightCircle size={14} />
              Change Stage
            </button>
            {submenu === "stage" ? (
              <div className="border-t border-zinc-700 py-1">
                {stageOptions.map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => onToast(`Stage updated to ${stage}`)}
                    className="w-full px-3 py-1 text-left text-xs text-zinc-400 hover:bg-zinc-700"
                  >
                    {stage}
                  </button>
                ))}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => onToggleSubmenu(submenu === "assign" ? null : "assign")}
              className="flex w-full items-center gap-2 px-3 py-2 hover:bg-zinc-700"
            >
              <UserPlus size={14} />
              Reassign
            </button>
            {submenu === "assign" ? (
              <div className="border-t border-zinc-700 py-1">
                {reps.map((rep) => (
                  <button
                    key={rep.id}
                    type="button"
                    onClick={() => onToast(`Reassigned to ${rep.name}`)}
                    className="w-full px-3 py-1 text-left text-xs text-zinc-400 hover:bg-zinc-700"
                  >
                    {rep.name}
                  </button>
                ))}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => onToast("Opening email composer...")}
              className="flex w-full items-center gap-2 px-3 py-2 hover:bg-zinc-700"
            >
              <Mail size={14} />
              Send Email
            </button>
            <button
              type="button"
              onClick={() => onToast("Lead removed (demo)")}
              className="flex w-full items-center gap-2 px-3 py-2 text-red-400 hover:bg-zinc-700"
            >
              <Trash2 size={14} />
              Remove
            </button>
          </motion.div>
        ) : null}
      </td>
    </tr>
  );
});
