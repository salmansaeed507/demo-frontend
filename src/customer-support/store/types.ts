import { products as seedProducts, type Product } from "../mock/products";
import {
  knowledgeDocs as seedDocs,
  tickets as seedTickets,
  type EmbeddingStatus,
  type KnowledgeDoc,
  type SupportTicket,
} from "../mock/admin";

export type { Product, KnowledgeDoc, SupportTicket, EmbeddingStatus };

export type OrderStatus =
  | "processing"
  | "out_for_delivery"
  | "delivered"
  | "refunded"
  | "cancelled";

export type Order = {
  id: string;
  customer: string;
  email: string;
  phone: string;
  shippingAddress: string;
  items: string;
  total: number;
  status: OrderStatus;
  shippingMethod: string;
  carrier: string;
  trackingNumber: string;
  paymentMethod: string;
  placedAt: string;
};

export type AgentTraceStep = {
  tool: string;
  input?: string;
  output: string;
  status: "ok" | "miss";
};

/** Proof that an answer was grounded in retrieved KB chunks. */
export type RetrievalCitation = {
  filename: string;
  excerpt: string;
  rank: number;
  score: number;
};

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  createdAt: string;
  /** Tool-calling trace for assistant messages (demo / simulated). */
  trace?: AgentTraceStep[];
  /** RAG citations when retrieve_knowledge returned chunks. */
  citations?: RetrievalCitation[];
};

export type ChatThread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};

export type ShopPilotState = {
  products: Product[];
  knowledgeDocs: KnowledgeDoc[];
  tickets: SupportTicket[];
  orders: Order[];
  threads: ChatThread[];
  activeThreadId: string;
};

export const STORAGE_KEY = "shoppilot-data-v4";

function estimateChunks(sizeKb: number) {
  return Math.max(4, Math.round(sizeKb / 4));
}

/** Backfill older localStorage docs missing RAG pipeline fields. */
export function normalizeKnowledgeDoc(
  raw: Partial<KnowledgeDoc> & Pick<KnowledgeDoc, "id" | "name">,
): KnowledgeDoc {
  const embeddingStatus: EmbeddingStatus =
    raw.embeddingStatus ??
    (raw.indexed === false ? "pending" : raw.indexed ? "ready" : "pending");
  const indexed = embeddingStatus === "ready";
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type ?? "PDF",
    sizeKb: raw.sizeKb ?? 0,
    indexed,
    uploadedAt: raw.uploadedAt ?? newDate(),
    chunkCount:
      raw.chunkCount ??
      (indexed ? estimateChunks(raw.sizeKb ?? 32) : 0),
    lastIndexedAt:
      raw.lastIndexedAt !== undefined
        ? raw.lastIndexedAt
        : indexed
          ? (raw.uploadedAt ?? newDate())
          : null,
    embeddingStatus,
    collection: raw.collection ?? "support",
    tags: Array.isArray(raw.tags) ? raw.tags : [],
  };
}

function id(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function createWelcomeThread(): ChatThread {
  const createdAt = nowIso();
  return {
    id: id("thr"),
    title: "New chat",
    createdAt,
    updatedAt: createdAt,
    messages: [],
  };
}

export function createSeedState(): ShopPilotState {
  const thread = createWelcomeThread();
  return {
    products: structuredClone(seedProducts),
    knowledgeDocs: structuredClone(seedDocs),
    tickets: structuredClone(seedTickets),
    orders: [
      {
        id: "48291",
        customer: "Sara Khan",
        email: "sara.khan@example.com",
        phone: "+1 (512) 555-0142",
        shippingAddress: "482 Oak Ave, Apt 4B, Austin, TX 78702",
        total: 178.99,
        status: "out_for_delivery",
        items: "Aurora Headphones ×1, SoftCotton Tee Pack ×1",
        shippingMethod: "Express",
        carrier: "UPS",
        trackingNumber: "1Z999AA10123456784",
        paymentMethod: "Visa ···· 4242",
        placedAt: "2026-09-01",
      },
      {
        id: "48288",
        customer: "Sam Chen",
        email: "sam.chen@example.com",
        phone: "+1 (415) 555-0198",
        shippingAddress: "90 Mission St, San Francisco, CA 94105",
        total: 89.0,
        status: "delivered",
        items: "TrailForge Backpack ×1",
        shippingMethod: "Standard",
        carrier: "USPS",
        trackingNumber: "9400111899223344556677",
        paymentMethod: "Mastercard ···· 4444",
        placedAt: "2026-08-28",
      },
      {
        id: "48275",
        customer: "Jordan Lee",
        email: "jordan.lee@example.com",
        phone: "+1 (206) 555-0177",
        shippingAddress: "1201 Pine St, Seattle, WA 98101",
        total: 49.0,
        status: "processing",
        items: "Nimbus Desk Lamp ×1",
        shippingMethod: "Standard",
        carrier: "—",
        trackingNumber: "Pending",
        paymentMethod: "PayPal",
        placedAt: "2026-09-02",
      },
      {
        id: "48260",
        customer: "Alex Rivera",
        email: "alex@example.com",
        phone: "+1 (512) 555-0101",
        shippingAddress: "123 Market St, Austin, TX 78701",
        total: 129.99,
        status: "refunded",
        items: "Aurora Headphones ×1",
        shippingMethod: "Standard",
        carrier: "FedEx",
        trackingNumber: "794612345678",
        paymentMethod: "Visa ···· 1881",
        placedAt: "2026-08-20",
      },
    ],
    threads: [thread],
    activeThreadId: thread.id,
  };
}

export function loadState(): ShopPilotState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    const parsed = JSON.parse(raw) as Partial<ShopPilotState>;
    const seed = createSeedState();
    const threads =
      Array.isArray(parsed.threads) && parsed.threads.length > 0
        ? parsed.threads
        : seed.threads;
    const activeThreadId =
      parsed.activeThreadId && threads.some((t) => t.id === parsed.activeThreadId)
        ? parsed.activeThreadId
        : threads[0].id;
    return {
      products: Array.isArray(parsed.products) ? parsed.products : seed.products,
      knowledgeDocs: Array.isArray(parsed.knowledgeDocs)
        ? parsed.knowledgeDocs.map((d) =>
            normalizeKnowledgeDoc(d as KnowledgeDoc),
          )
        : seed.knowledgeDocs,
      tickets: Array.isArray(parsed.tickets) ? parsed.tickets : seed.tickets,
      orders: Array.isArray(parsed.orders)
        ? parsed.orders.map((o) => normalizeOrder(o as Order))
        : seed.orders,
      threads,
      activeThreadId,
    };
  } catch {
    return createSeedState();
  }
}

export function saveState(state: ShopPilotState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function newId(prefix: string) {
  return id(prefix);
}

export function newIso() {
  return nowIso();
}

export function newDate() {
  return today();
}

export function normalizeOrder(o: Partial<Order> & Pick<Order, "id">): Order {
  return {
    id: o.id,
    customer: o.customer ?? "Unknown",
    email: o.email ?? "",
    phone: o.phone ?? "",
    shippingAddress: o.shippingAddress ?? "",
    items: o.items ?? "",
    total: typeof o.total === "number" ? o.total : 0,
    status: o.status ?? "processing",
    shippingMethod: o.shippingMethod ?? "Standard",
    carrier: o.carrier ?? "—",
    trackingNumber: o.trackingNumber ?? "Pending",
    paymentMethod: o.paymentMethod ?? "",
    placedAt: o.placedAt ?? today(),
  };
}

const KB_EXCERPTS: Record<string, string[]> = {
  "shipping-policy.pdf": [
    "Standard shipping arrives in 3–5 business days. Express options ship within 1–2 business days after fulfillment.",
    "We currently ship to the contiguous United States. Tracking numbers are emailed when the carrier scans the package.",
  ],
  "returns-and-refunds.md": [
    "Unused items may be returned within 30 days of delivery with the original receipt or order confirmation.",
    "Refunds are issued to the original payment method and typically post within 5–7 business days after we receive the return.",
  ],
  "product-faq.docx": [
    "Most electronics include a 1-year limited manufacturer warranty covering defects in materials and workmanship.",
    "For sizing and fit questions, check the product page Size Guide before opening a return.",
  ],
  "warranty-guide.pdf": [
    "Warranty claims require proof of purchase and a description of the defect. Cosmetic wear is not covered.",
    "Approved warranty replacements ship free; refurbished units may be issued when new stock is unavailable.",
  ],
};

function excerptsForDoc(name: string): string[] {
  const key = Object.keys(KB_EXCERPTS).find(
    (k) => k.toLowerCase() === name.toLowerCase(),
  );
  if (key) return KB_EXCERPTS[key];
  return [
    `Relevant section from ${name} matching the customer query.`,
    `Additional context retrieved from ${name} for grounding the reply.`,
  ];
}

function buildCitations(
  docs: { name: string; score: number }[],
): RetrievalCitation[] {
  return docs.map((d, i) => ({
    filename: d.name,
    excerpt: excerptsForDoc(d.name)[i % excerptsForDoc(d.name).length],
    rank: i + 1,
    score: d.score,
  }));
}

function scoreDoc(name: string, query: string): number {
  const n = name.toLowerCase();
  const q = query.toLowerCase();
  let score = 0.55;
  if (q.includes("return") || q.includes("refund")) {
    if (n.includes("return") || n.includes("refund")) score = 0.91;
    else if (n.includes("shipping")) score = 0.62;
    else if (n.includes("warranty")) score = 0.58;
  } else if (q.includes("ship") || q.includes("deliver")) {
    if (n.includes("shipping")) score = 0.89;
    else if (n.includes("return")) score = 0.61;
  } else if (q.includes("warrant")) {
    if (n.includes("warrant")) score = 0.9;
    else if (n.includes("faq") || n.includes("product")) score = 0.7;
  } else if (q.includes("faq") || q.includes("product")) {
    if (n.includes("faq") || n.includes("product")) score = 0.86;
  }
  return Math.round(score * 100) / 100;
}

export type AgentTurnResult = {
  text: string;
  trace: AgentTraceStep[];
  citations?: RetrievalCitation[];
};

export function simulateAgentTurn(
  text: string,
  state: ShopPilotState,
): AgentTurnResult {
  const lower = text.toLowerCase();
  const trace: AgentTraceStep[] = [
    {
      tool: "plan",
      input: text.slice(0, 80) + (text.length > 80 ? "…" : ""),
      output: "Classify intent and choose tools",
      status: "ok",
    },
  ];

  const orderMatch = lower.match(/#?\b(\d{4,})\b/);
  if (orderMatch) {
    const orderId = orderMatch[1];
    const order = state.orders.find((o) => o.id === orderId);
    if (order) {
      trace.push({
        tool: "get_order",
        input: `order_id=${order.id}`,
        output: `status=${order.status} · customer=${order.customer} · total=${order.total.toFixed(2)} · items=${order.items} · ship_to=${order.shippingAddress} · tracking=${order.trackingNumber}`,
        status: "ok",
      });
      trace.push({
        tool: "compose_reply",
        output: "Answer from order API result (not model memory)",
        status: "ok",
      });
      return {
        text: `Order #${order.id} for ${order.customer} is ${order.status.replaceAll("_", " ")}. Items: ${order.items}. Total $${order.total.toFixed(2)}. Shipping to ${order.shippingAddress} via ${order.shippingMethod}${order.carrier && order.carrier !== "—" ? ` (${order.carrier})` : ""}${order.trackingNumber && order.trackingNumber !== "Pending" ? ` · tracking ${order.trackingNumber}` : ""}.`,
        trace,
      };
    }
    trace.push({
      tool: "get_order",
      input: `order_id=${orderId}`,
      output: "No order found",
      status: "miss",
    });
    trace.push({
      tool: "compose_reply",
      output: "Report miss; suggest checking the order id",
      status: "ok",
    });
    return {
      text: `I couldn't find order #${orderId} in the order API. Double-check the id or create a ticket if you need a human to dig in.`,
      trace,
    };
  }

  const wantsKb =
    lower.includes("return") ||
    lower.includes("refund") ||
    lower.includes("ship") ||
    lower.includes("deliver") ||
    lower.includes("warrant") ||
    lower.includes("policy") ||
    lower.includes("faq");

  if (wantsKb) {
    const query = lower.includes("refund")
      ? "refund timeline"
      : lower.includes("return")
        ? "return window"
        : lower.includes("warrant")
          ? "warranty coverage"
          : lower.includes("ship") || lower.includes("deliver")
            ? "shipping times"
            : text.slice(0, 48);

    const indexed = state.knowledgeDocs.filter(
      (d) => d.embeddingStatus === "ready" || d.indexed,
    );
    const ranked = indexed
      .map((d) => ({ name: d.name, score: scoreDoc(d.name, lower) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .filter((d) => d.score >= 0.58);

    const citations =
      ranked.length > 0 ? buildCitations(ranked) : undefined;

    trace.push({
      tool: "retrieve_knowledge",
      input: `query="${query}"`,
      output: citations
        ? `${citations.length} chunk(s): ${citations.map((c) => `${c.filename}#${c.rank}`).join(", ")}`
        : "0 chunks (KB empty or unindexed)",
      status: citations ? "ok" : "miss",
    });
    trace.push({
      tool: "compose_reply",
      output: citations
        ? "Ground answer in retrieved chunks + cite sources"
        : "Fallback policy copy (no retrieval hits)",
      status: "ok",
    });

    if (citations) {
      const top = citations[0];
      if (top.filename.toLowerCase().includes("return") || lower.includes("return") || lower.includes("refund")) {
        return {
          text: `Based on ${top.filename}: unused items can be returned within 30 days with the original receipt. Refunds post in 5–7 business days after we receive the item.`,
          trace,
          citations,
        };
      }
      if (top.filename.toLowerCase().includes("shipping") || lower.includes("ship")) {
        return {
          text: `Based on ${top.filename}: standard shipping is 3–5 business days; express is typically 1–2 business days after fulfillment. You’ll get a tracking email when the carrier scans the package.`,
          trace,
          citations,
        };
      }
      if (top.filename.toLowerCase().includes("warrant")) {
        return {
          text: `Based on ${top.filename}: most electronics include a 1-year limited warranty for defects. Claims need proof of purchase; cosmetic wear isn’t covered.`,
          trace,
          citations,
        };
      }
      return {
        text: `I found relevant guidance in ${top.filename}. ${top.excerpt}`,
        trace,
        citations,
      };
    }

    return {
      text: "I couldn't retrieve indexed knowledge for that yet. Index a policy doc in RAG / Knowledge, then ask again.",
      trace,
    };
  }

  const ticketIdMatch = lower.match(/\b(tck[- ]?\d+)\b/i);
  if (ticketIdMatch || (lower.includes("ticket") && !lower.includes("create"))) {
    if (ticketIdMatch) {
      const raw = ticketIdMatch[1].toUpperCase().replace(/\s+/g, "-");
      const id = raw.startsWith("TCK") ? raw.replace("TCK", "TCK-").replace("TCK--", "TCK-") : raw;
      const normalized = id.includes("TCK-") ? id : `TCK-${id}`;
      const ticket =
        state.tickets.find((t) => t.id.toLowerCase() === normalized.toLowerCase()) ||
        state.tickets.find((t) =>
          t.id.toLowerCase().includes(ticketIdMatch[1].replace(/\s+/g, "").toLowerCase()),
        );
      if (ticket) {
        trace.push({
          tool: "get_ticket",
          input: `ticket_id=${ticket.id}`,
          output: `status=${ticket.status} · priority=${ticket.priority} · customer=${ticket.customer}`,
          status: "ok",
        });
        trace.push({
          tool: "compose_reply",
          output: "Summarize ticket from ticketing API",
          status: "ok",
        });
        return {
          text: `Ticket ${ticket.id} (${ticket.status}, ${ticket.priority}): ${ticket.summary} — opened for ${ticket.customer} (${ticket.createdAgo}).`,
          trace,
        };
      }
      trace.push({
        tool: "get_ticket",
        input: `ticket_id=${normalized}`,
        output: "Ticket not found",
        status: "miss",
      });
    } else {
      const open = state.tickets.filter((t) => t.status === "open");
      trace.push({
        tool: "list_tickets",
        input: 'status="open"',
        output: `${open.length} open ticket(s)`,
        status: "ok",
      });
      trace.push({
        tool: "compose_reply",
        output: "Summarize open-ticket count from API",
        status: "ok",
      });
      return {
        text: `There are currently ${open.length} open ticket(s). Ask for a ticket id (e.g. ${state.tickets[0]?.id ?? "TCK-1042"}) for details, or say “create ticket …” to open one.`,
        trace,
      };
    }
    trace.push({
      tool: "compose_reply",
      output: "Explain miss and next steps",
      status: "ok",
    });
    return {
      text: "I couldn't find that ticket. Try a full id like TCK-1042, or say “create ticket …” to open a new one.",
      trace,
    };
  }

  const product = state.products.find((p) => {
    const name = p.name.toLowerCase();
    const tokens = name.split(/\s+/).filter((t) => t.length >= 4);
    return (
      lower.includes(name) ||
      lower.includes(name.slice(0, 8)) ||
      tokens.some((t) => lower.includes(t))
    );
  });
  if (product) {
    trace.push({
      tool: "get_product",
      input: `product_id=${product.id}`,
      output: `name=${product.name} · price=${product.price} · stock=${product.stock}`,
      status: "ok",
    });
    trace.push({
      tool: "compose_reply",
      output: "Answer from catalog API",
      status: "ok",
    });
    return {
      text: `${product.name} — $${product.price}, ${product.category}, stock ${product.stock}. ${product.description}`,
      trace,
    };
  }

  if (lower.includes("product") || lower.includes("stock") || lower.includes("catalog")) {
    const hits = state.products.slice(0, 3);
    trace.push({
      tool: "search_catalog",
      input: `query="${text.slice(0, 40)}"`,
      output: `${hits.length} product(s): ${hits.map((p) => p.name).join(", ") || "none"}`,
      status: hits.length ? "ok" : "miss",
    });
    trace.push({
      tool: "compose_reply",
      output: "List catalog hits from product API",
      status: "ok",
    });
    const names = hits.map((p) => `${p.name} ($${p.price})`).join("; ");
    return {
      text: hits.length
        ? `I can look up catalog items. Examples: ${names}. Ask about a specific product name for details.`
        : "The catalog looks empty right now — add a product in the Products panel, then ask again.",
      trace,
    };
  }

  trace.push({
    tool: "retrieve_knowledge",
    input: `query="${text.slice(0, 48)}"`,
    output: "0 high-confidence chunks",
    status: "miss",
  });
  trace.push({
    tool: "compose_reply",
    output: "Escalate: insufficient tool evidence",
    status: "ok",
  });
  return {
    text: "I don't have enough information to answer confidently. Try asking about an order number, a product, returns, shipping, a ticket id, or say “create ticket” to open a support ticket.",
    trace,
  };
}
