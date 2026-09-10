import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "../mock/products";
import type {
  ChatMessage,
  ChatThread,
  KnowledgeDoc,
  Order,
  OrderStatus,
  ShopPilotState,
  SupportTicket,
  AgentTraceStep,
  RetrievalCitation,
  EmbeddingStatus,
} from "./types";
import {
  createWelcomeThread,
  loadState,
  newDate,
  newId,
  newIso,
  saveState,
  simulateAgentTurn,
  STORAGE_KEY,
  createSeedState,
} from "./types";

type ProductInput = Omit<Product, "id"> & { id?: string };
type DocInput = Omit<KnowledgeDoc, "id"> & { id?: string };
type TicketInput = Omit<SupportTicket, "id"> & { id?: string };
type OrderInput = Omit<Order, "id"> & { id?: string };

type ShopPilotContextValue = {
  state: ShopPilotState;
  products: Product[];
  knowledgeDocs: KnowledgeDoc[];
  tickets: SupportTicket[];
  orders: Order[];
  threads: ChatThread[];
  activeThreadId: string;
  activeThread: ChatThread | undefined;
  getProduct: (id: string) => Product | undefined;
  // Products
  createProduct: (input: ProductInput) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Knowledge
  createDoc: (input: DocInput) => KnowledgeDoc;
  updateDoc: (id: string, patch: Partial<KnowledgeDoc>) => void;
  deleteDoc: (id: string) => void;
  // Tickets
  createTicket: (input: TicketInput) => SupportTicket;
  updateTicket: (id: string, patch: Partial<SupportTicket>) => void;
  deleteTicket: (id: string) => void;
  // Orders
  createOrder: (input: OrderInput) => Order;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  // Threads / chat
  setActiveThreadId: (id: string) => void;
  createThread: () => ChatThread;
  renameThread: (id: string, title: string) => void;
  deleteThread: (id: string) => void;
  /** Append user message and return the planned assistant turn (does not add assistant yet). */
  beginAgentTurn: (text: string) => AgentTurnPlan | null;
  /** Append assistant reply + apply any side effects from the plan. */
  completeAgentTurn: (plan: AgentTurnPlan) => void;
  clearThreadMessages: (id: string) => void;
  resetDemoData: () => void;
};

export type AgentTurnPlan = {
  threadId: string;
  reply: string;
  trace: AgentTraceStep[];
  citations?: RetrievalCitation[];
  ticket?: SupportTicket;
};

const ShopPilotContext = createContext<ShopPilotContextValue | null>(null);

function nextTicketId(tickets: SupportTicket[]) {
  const nums = tickets
    .map((t) => Number(t.id.replace(/\D/g, "")))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 1000;
  return `TCK-${max + 1}`;
}

function nextOrderId(orders: Order[]) {
  const nums = orders.map((o) => Number(o.id)).filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 48000;
  return String(max + 1);
}

export function ShopPilotProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ShopPilotState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setActiveThreadId = useCallback((id: string) => {
    setState((s) => ({ ...s, activeThreadId: id }));
  }, []);

  const getProduct = useCallback(
    (id: string) => state.products.find((p) => p.id === id),
    [state.products],
  );

  const createProduct = useCallback((input: ProductInput) => {
    const product: Product = {
      id: input.id ?? newId("p"),
      name: input.name,
      price: input.price,
      category: input.category,
      description: input.description,
      stock: input.stock,
      imageUrl: input.imageUrl,
    };
    setState((s) => ({ ...s, products: [product, ...s.products] }));
    return product;
  }, []);

  const updateProduct = useCallback((id: string, patch: Partial<Product>) => {
    setState((s) => ({
      ...s,
      products: s.products.map((p) => (p.id === id ? { ...p, ...patch, id } : p)),
    }));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      products: s.products.filter((p) => p.id !== id),
    }));
  }, []);

  const createDoc = useCallback((input: DocInput) => {
    const status = input.embeddingStatus ?? (input.indexed ? "ready" : "pending");
    const doc: KnowledgeDoc = {
      id: input.id ?? newId("doc"),
      name: input.name,
      type: input.type,
      sizeKb: input.sizeKb,
      embeddingStatus: status,
      indexed: status === "ready",
      uploadedAt: input.uploadedAt ?? newDate(),
      chunkCount:
        input.chunkCount ??
        (status === "ready" ? Math.max(4, Math.round(input.sizeKb / 4)) : 0),
      lastIndexedAt:
        input.lastIndexedAt !== undefined
          ? input.lastIndexedAt
          : status === "ready"
            ? newIso()
            : null,
      collection: input.collection?.trim() || "support",
      tags: input.tags ?? [],
    };
    setState((s) => ({
      ...s,
      knowledgeDocs: [doc, ...s.knowledgeDocs],
    }));
    return doc;
  }, []);

  const updateDoc = useCallback((id: string, patch: Partial<KnowledgeDoc>) => {
    setState((s) => ({
      ...s,
      knowledgeDocs: s.knowledgeDocs.map((d) => {
        if (d.id !== id) return d;
        const next = { ...d, ...patch, id };
        if (patch.embeddingStatus) {
          next.indexed = patch.embeddingStatus === "ready";
        } else if (typeof patch.indexed === "boolean") {
          next.embeddingStatus = patch.indexed ? "ready" : "pending";
          next.indexed = patch.indexed;
        }
        return next;
      }),
    }));
  }, []);

  const deleteDoc = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      knowledgeDocs: s.knowledgeDocs.filter((d) => d.id !== id),
    }));
  }, []);

  const createTicket = useCallback((input: TicketInput) => {
    let ticket!: SupportTicket;
    setState((s) => {
      ticket = {
        id: input.id ?? nextTicketId(s.tickets),
        customer: input.customer,
        summary: input.summary,
        conversationId: input.conversationId ?? newId("conv"),
        priority: input.priority,
        status: input.status,
        createdAgo: input.createdAgo ?? "just now",
      };
      return { ...s, tickets: [ticket, ...s.tickets] };
    });
    return ticket;
  }, []);

  const updateTicket = useCallback(
    (id: string, patch: Partial<SupportTicket>) => {
      setState((s) => ({
        ...s,
        tickets: s.tickets.map((t) =>
          t.id === id ? { ...t, ...patch, id } : t,
        ),
      }));
    },
    [],
  );

  const deleteTicket = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      tickets: s.tickets.filter((t) => t.id !== id),
    }));
  }, []);

  const createOrder = useCallback((input: OrderInput) => {
    let order!: Order;
    setState((s) => {
      order = {
        id: input.id ?? nextOrderId(s.orders),
        customer: input.customer,
        email: input.email,
        phone: input.phone,
        shippingAddress: input.shippingAddress,
        total: input.total,
        status: input.status,
        items: input.items,
        shippingMethod: input.shippingMethod,
        carrier: input.carrier,
        trackingNumber: input.trackingNumber,
        paymentMethod: input.paymentMethod,
        placedAt: input.placedAt ?? newDate(),
      };
      return { ...s, orders: [order, ...s.orders] };
    });
    return order;
  }, []);

  const updateOrder = useCallback((id: string, patch: Partial<Order>) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch, id } : o)),
    }));
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      orders: s.orders.filter((o) => o.id !== id),
    }));
  }, []);

  const createThread = useCallback(() => {
    const thread = createWelcomeThread();
    setState((s) => ({
      ...s,
      threads: [thread, ...s.threads],
      activeThreadId: thread.id,
    }));
    return thread;
  }, []);

  const renameThread = useCallback((id: string, title: string) => {
    setState((s) => ({
      ...s,
      threads: s.threads.map((t) =>
        t.id === id ? { ...t, title: title.trim() || t.title, updatedAt: newIso() } : t,
      ),
    }));
  }, []);

  const deleteThread = useCallback((id: string) => {
    setState((s) => {
      const remaining = s.threads.filter((t) => t.id !== id);
      const threads = remaining.length > 0 ? remaining : [createWelcomeThread()];
      const activeThreadId =
        s.activeThreadId === id ? threads[0].id : s.activeThreadId;
      return { ...s, threads, activeThreadId };
    });
  }, []);

  const clearThreadMessages = useCallback((id: string) => {
    const createdAt = newIso();
    setState((s) => ({
      ...s,
      threads: s.threads.map((t) =>
        t.id === id
          ? { ...t, messages: [], updatedAt: createdAt, title: "New chat" }
          : t,
      ),
    }));
  }, []);

  const beginAgentTurn = useCallback((text: string): AgentTurnPlan | null => {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const userAt = newIso();
    const userMsg: ChatMessage = {
      id: newId("msg"),
      role: "user",
      text: trimmed,
      createdAt: userAt,
    };

    let plan: AgentTurnPlan | null = null;

    setState((s) => {
      const threadId = s.activeThreadId;
      const lower = trimmed.toLowerCase();
      let reply: string;
      let trace: AgentTraceStep[];
      let citations: RetrievalCitation[] | undefined;
      let ticket: SupportTicket | undefined;

      if (lower.includes("create ticket")) {
        const summary =
          trimmed.replace(/create ticket[:\s]*/i, "").trim() || trimmed;
        ticket = {
          id: nextTicketId(s.tickets),
          customer: "Admin chat user",
          summary,
          conversationId: threadId,
          priority: "medium",
          status: "open",
          createdAgo: "just now",
        };
        reply = `Created ticket ${ticket.id}: “${ticket.summary}”. Priority medium, status open.`;
        trace = [
          {
            tool: "plan",
            input: trimmed.slice(0, 80),
            output: "Intent: create_ticket",
            status: "ok",
          },
          {
            tool: "create_ticket",
            input: `summary="${summary.slice(0, 60)}" · priority=medium`,
            output: `ticket_id=${ticket.id} · status=open`,
            status: "ok",
          },
          {
            tool: "compose_reply",
            output: "Confirm ticket created via ticketing API",
            status: "ok",
          },
        ];
      } else {
        const turn = simulateAgentTurn(trimmed, s);
        reply = turn.text;
        trace = turn.trace;
        citations = turn.citations;
      }

      plan = { threadId, reply, trace, citations, ticket };

      const threads = s.threads.map((t) => {
        if (t.id !== threadId) return t;
        const isDefaultTitle = t.title === "New chat";
        const title = isDefaultTitle
          ? trimmed.slice(0, 42) + (trimmed.length > 42 ? "…" : "")
          : t.title;
        return {
          ...t,
          title,
          updatedAt: userAt,
          messages: [...t.messages, userMsg],
        };
      });

      return { ...s, threads };
    });

    return plan;
  }, []);

  const completeAgentTurn = useCallback((plan: AgentTurnPlan) => {
    const assistantMsg: ChatMessage = {
      id: newId("msg"),
      role: "assistant",
      text: plan.reply,
      createdAt: newIso(),
      trace: plan.trace,
      citations: plan.citations,
    };

    setState((s) => ({
      ...s,
      tickets: plan.ticket ? [plan.ticket, ...s.tickets] : s.tickets,
      threads: s.threads.map((t) =>
        t.id === plan.threadId
          ? {
              ...t,
              updatedAt: newIso(),
              messages: [...t.messages, assistantMsg],
            }
          : t,
      ),
    }));
  }, []);

  const resetDemoData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(createSeedState());
  }, []);

  const activeThread = useMemo(
    () => state.threads.find((t) => t.id === state.activeThreadId),
    [state.threads, state.activeThreadId],
  );

  const value = useMemo<ShopPilotContextValue>(
    () => ({
      state,
      products: state.products,
      knowledgeDocs: state.knowledgeDocs,
      tickets: state.tickets,
      orders: state.orders,
      threads: state.threads,
      activeThreadId: state.activeThreadId,
      activeThread,
      getProduct,
      createProduct,
      updateProduct,
      deleteProduct,
      createDoc,
      updateDoc,
      deleteDoc,
      createTicket,
      updateTicket,
      deleteTicket,
      createOrder,
      updateOrder,
      deleteOrder,
      setActiveThreadId,
      createThread,
      renameThread,
      deleteThread,
      beginAgentTurn,
      completeAgentTurn,
      clearThreadMessages,
      resetDemoData,
    }),
    [
      state,
      activeThread,
      getProduct,
      createProduct,
      updateProduct,
      deleteProduct,
      createDoc,
      updateDoc,
      deleteDoc,
      createTicket,
      updateTicket,
      deleteTicket,
      createOrder,
      updateOrder,
      deleteOrder,
      setActiveThreadId,
      createThread,
      renameThread,
      deleteThread,
      beginAgentTurn,
      completeAgentTurn,
      clearThreadMessages,
      resetDemoData,
    ],
  );

  return (
    <ShopPilotContext.Provider value={value}>{children}</ShopPilotContext.Provider>
  );
}

export function useShopPilot() {
  const ctx = useContext(ShopPilotContext);
  if (!ctx) {
    throw new Error("useShopPilot must be used within ShopPilotProvider");
  }
  return ctx;
}

export type {
  ChatMessage,
  ChatThread,
  KnowledgeDoc,
  Order,
  OrderStatus,
  SupportTicket,
  AgentTraceStep,
  RetrievalCitation,
  EmbeddingStatus,
};
