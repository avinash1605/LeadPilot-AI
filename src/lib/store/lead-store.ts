import { create } from "zustand";
import type { Lead } from "@/lib/types";
import { leads as mockLeads } from "@/lib/mock-data/leads";

type LeadFilters = {
  source: string | null;
  stage: string | null;
  temperature: string | null;
  assignedTo: string | null;
  search: string;
};

interface LeadState {
  leads: Lead[];
  filteredLeads: Lead[];
  selectedLead: Lead | null;
  filters: LeadFilters;
  setFilter: (key: keyof LeadFilters, value: string | null) => void;
  clearFilters: () => void;
  selectLead: (lead: Lead | null) => void;
  updateLeadStage: (leadId: string, stage: Lead["stage"]) => void;
  getLeadsForUser: (userId: string) => Lead[];
}

const defaultFilters: LeadFilters = {
  source: null,
  stage: null,
  temperature: null,
  assignedTo: null,
  search: "",
};

const applyFilters = (leads: Lead[], filters: LeadFilters) => {
  const searchTerm = filters.search.trim().toLowerCase();

  return leads.filter((lead) => {
    if (filters.source && lead.source !== filters.source) return false;
    if (filters.stage && lead.stage !== filters.stage) return false;
    if (filters.temperature && lead.temperature !== filters.temperature) return false;
    if (filters.assignedTo && lead.assignedTo !== filters.assignedTo) return false;

    if (!searchTerm) return true;

    const haystack = `${lead.name} ${lead.company} ${lead.email}`.toLowerCase();
    return haystack.includes(searchTerm);
  });
};

export const useLeadStore = create<LeadState>((set, get) => ({
  leads: mockLeads,
  filteredLeads: mockLeads,
  selectedLead: null,
  filters: defaultFilters,
  setFilter: (key, value) =>
    set((state) => {
      const nextFilters = {
        ...state.filters,
        [key]: value ?? "",
      };
      if (key !== "search" && value === null) {
        nextFilters[key] = null;
      }
      const nextFiltered = applyFilters(state.leads, nextFilters);
      return { filters: nextFilters, filteredLeads: nextFiltered };
    }),
  clearFilters: () =>
    set((state) => ({
      filters: defaultFilters,
      filteredLeads: applyFilters(state.leads, defaultFilters),
    })),
  selectLead: (lead) => set({ selectedLead: lead }),
  updateLeadStage: (leadId, stage) =>
    set((state) => {
      const updatedLeads = state.leads.map((lead) =>
        lead.id === leadId ? { ...lead, stage } : lead
      );
      const updatedSelected =
        state.selectedLead?.id === leadId
          ? { ...state.selectedLead, stage }
          : state.selectedLead;
      return {
        leads: updatedLeads,
        filteredLeads: applyFilters(updatedLeads, state.filters),
        selectedLead: updatedSelected,
      };
    }),
  getLeadsForUser: (userId) =>
    get().leads.filter((lead) => lead.assignedTo === userId),
}));
