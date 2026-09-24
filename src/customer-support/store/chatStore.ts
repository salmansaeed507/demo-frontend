import { create } from "zustand";
import type {
  ChatMessage,
  ChatThread,
  SupportTicket,
  AgentTraceStep,
  RetrievalCitation,
} from "./types";
import * as customerSupportApi from "../../api/customerSupport";
import {
  mapCitations,
  mapMessage,
  mapTicket,
  mapThread,
  mapTrace,
} from "../../api/mappers";
import { useTicketsStore } from "./ticketsStore";
import type { DomainLoadStatus } from "./loadStatus";

export type AgentTurnPlan = {
  threadId: string;
  reply: string;
  trace: AgentTraceStep[];
  citations?: RetrievalCitation[];
  ticket?: SupportTicket;
  assistantMessage: ChatMessage;
};

type ChatState = {
  threads: ChatThread[];
  activeThreadId: string;
  status: DomainLoadStatus;
  error: string | null;
  setThreads: (threads: ChatThread[], activeThreadId?: string) => void;
  load: (opts?: { force?: boolean }) => Promise<void>;
  setActiveThreadId: (id: string) => void;
  createThread: () => Promise<ChatThread>;
  renameThread: (id: string, title: string) => Promise<void>;
  deleteThread: (id: string) => Promise<void>;
  clearThreadMessages: (id: string) => Promise<void>;
  beginAgentTurn: (text: string) => Promise<AgentTurnPlan | null>;
  completeAgentTurn: (plan: AgentTurnPlan) => void;
};

let inflight: Promise<void> | null = null;

export const useChatStore = create<ChatState>((set, get) => ({
  threads: [],
  activeThreadId: "",
  status: "idle",
  error: null,
  setThreads: (threads, activeThreadId) => {
    const prev = get().activeThreadId;
    const activeStillExists = threads.some((t) => t.id === prev);
    set({
      threads,
      activeThreadId:
        activeThreadId ??
        (activeStillExists ? prev : (threads[0]?.id ?? "")),
    });
  },
  load: async (opts) => {
    const force = opts?.force ?? false;
    const { status } = get();
    if (!force && status === "ready") return;
    if (inflight) return inflight;

    set({ status: "loading", error: null });
    inflight = (async () => {
      try {
        let mappedThreads = (
          await customerSupportApi.listChatThreads()
        ).map(mapThread);
        if (mappedThreads.length === 0) {
          mappedThreads = [
            mapThread(
              await customerSupportApi.createChatThread({ title: "New chat" }),
            ),
          ];
        }
        get().setThreads(mappedThreads);
        set({ status: "ready", error: null });
      } catch (err) {
        set({
          status: "error",
          error: err instanceof Error ? err.message : "Failed to load chats",
        });
      } finally {
        inflight = null;
      }
    })();
    return inflight;
  },
  setActiveThreadId: (id) => set({ activeThreadId: id }),
  createThread: async () => {
    const thread = mapThread(
      await customerSupportApi.createChatThread({ title: "New chat" }),
    );
    set((s) => ({
      threads: [thread, ...s.threads],
      activeThreadId: thread.id,
    }));
    return thread;
  },
  renameThread: async (id, title) => {
    const updated = mapThread(
      await customerSupportApi.updateChatThread(id, {
        title: title.trim() || "New chat",
      }),
    );
    set((s) => ({
      threads: s.threads.map((t) =>
        t.id === id ? { ...updated, messages: t.messages } : t,
      ),
    }));
  },
  deleteThread: async (id) => {
    await customerSupportApi.deleteChatThread(id);
    let mappedThreads = (
      await customerSupportApi.listChatThreads()
    ).map(mapThread);
    if (mappedThreads.length === 0) {
      mappedThreads = [
        mapThread(
          await customerSupportApi.createChatThread({ title: "New chat" }),
        ),
      ];
    }
    get().setThreads(mappedThreads);
  },
  clearThreadMessages: async (id) => {
    const updated = mapThread(await customerSupportApi.clearChatThread(id));
    set((s) => ({
      threads: s.threads.map((t) => (t.id === id ? updated : t)),
    }));
  },
  beginAgentTurn: async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return null;

    const threadId = get().activeThreadId || undefined;
    const res = await customerSupportApi.agentTurn({
      text: trimmed,
      threadId: threadId || null,
    });

    const userMsg = mapMessage(res.userMessage);
    const assistantMsg = mapMessage(res.assistantMessage);
    const ticket = res.ticket ? mapTicket(res.ticket) : undefined;

    if (ticket) {
      useTicketsStore.getState().upsertTicket(ticket);
    }

    set((s) => {
      const threads = s.threads.some((t) => t.id === res.threadId)
        ? s.threads.map((t) => {
            if (t.id !== res.threadId) return t;
            const withoutDup = t.messages.filter((m) => m.id !== userMsg.id);
            return {
              ...t,
              title:
                t.title === "New chat"
                  ? trimmed.slice(0, 42) + (trimmed.length > 42 ? "…" : "")
                  : t.title,
              updatedAt: userMsg.createdAt,
              messages: [...withoutDup, userMsg],
            };
          })
        : [
            {
              id: res.threadId,
              title: trimmed.slice(0, 42) + (trimmed.length > 42 ? "…" : ""),
              createdAt: userMsg.createdAt,
              updatedAt: userMsg.createdAt,
              messages: [userMsg],
            },
            ...s.threads,
          ];

      return {
        activeThreadId: res.threadId,
        threads,
      };
    });

    return {
      threadId: res.threadId,
      reply: assistantMsg.text,
      trace: mapTrace(res.assistantMessage.trace),
      citations: mapCitations(res.assistantMessage.citations),
      ticket,
      assistantMessage: assistantMsg,
    };
  },
  completeAgentTurn: (plan) => {
    set((s) => ({
      threads: s.threads.map((t) =>
        t.id === plan.threadId
          ? {
              ...t,
              updatedAt: plan.assistantMessage.createdAt,
              messages: [
                ...t.messages.filter((m) => m.id !== plan.assistantMessage.id),
                plan.assistantMessage,
              ],
            }
          : t,
      ),
    }));
  },
}));

export function selectActiveThread(state: ChatState) {
  return state.threads.find((t) => t.id === state.activeThreadId);
}
