import { create } from "zustand";
import type { SupportTicket } from "./types";
import * as customerSupportApi from "../../api/customerSupport";
import { mapTicket } from "../../api/mappers";
import type { DomainLoadStatus } from "./loadStatus";

type TicketInput = Omit<SupportTicket, "id"> & { id?: string };

type TicketsState = {
  tickets: SupportTicket[];
  status: DomainLoadStatus;
  error: string | null;
  setTickets: (tickets: SupportTicket[]) => void;
  load: (opts?: { force?: boolean }) => Promise<void>;
  upsertTicket: (ticket: SupportTicket) => void;
  createTicket: (input: TicketInput) => Promise<SupportTicket>;
  updateTicket: (id: string, patch: Partial<SupportTicket>) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
};

let inflight: Promise<void> | null = null;

export const useTicketsStore = create<TicketsState>((set) => ({
  tickets: [],
  status: "idle",
  error: null,
  setTickets: (tickets) => set({ tickets }),
  load: async (opts) => {
    const force = opts?.force ?? false;
    const { status } = useTicketsStore.getState();
    if (!force && status === "ready") return;
    if (inflight) return inflight;

    set({ status: "loading", error: null });
    inflight = (async () => {
      try {
        const tickets = (await customerSupportApi.listTickets()).map(mapTicket);
        set({ tickets, status: "ready", error: null });
      } catch (err) {
        set({
          status: "error",
          error: err instanceof Error ? err.message : "Failed to load tickets",
        });
      } finally {
        inflight = null;
      }
    })();
    return inflight;
  },
  upsertTicket: (ticket) =>
    set((s) => ({
      tickets: [ticket, ...s.tickets.filter((t) => t.id !== ticket.id)],
    })),
  createTicket: async (input) => {
    const created = mapTicket(
      await customerSupportApi.createTicket({
        id: input.id,
        customer: input.customer,
        summary: input.summary,
        conversationId: input.conversationId,
        priority: input.priority,
        status: input.status,
      }),
    );
    set((s) => ({ tickets: [created, ...s.tickets], status: "ready" }));
    return created;
  },
  updateTicket: async (id, patch) => {
    const updated = mapTicket(
      await customerSupportApi.updateTicket(id, {
        customer: patch.customer,
        summary: patch.summary,
        conversationId: patch.conversationId,
        priority: patch.priority,
        status: patch.status,
      }),
    );
    set((s) => ({
      tickets: s.tickets.map((t) => (t.id === id ? updated : t)),
    }));
  },
  deleteTicket: async (id) => {
    await customerSupportApi.deleteTicket(id);
    set((s) => ({ tickets: s.tickets.filter((t) => t.id !== id) }));
  },
}));
