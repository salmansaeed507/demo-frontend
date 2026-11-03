import type { Product } from "../mock/products";
import type {
  EmbeddingStatus,
  KnowledgeDoc,
  SupportTicket,
} from "../mock/admin";

export type { Product, KnowledgeDoc, SupportTicket, EmbeddingStatus };

export type OrderStatus =
  | "processing"
  | "out_for_delivery"
  | "delivered"
  | "refunded"
  | "cancelled";

export type OrderLineItem = {
  id?: string;
  productId: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  customer: string;
  email: string;
  phone: string;
  shippingAddress: string;
  items: OrderLineItem[];
  total: number;
  status: OrderStatus;
  shippingMethod: string;
  carrier: string;
  trackingNumber: string;
  paymentMethod: string;
  placedAt: string;
};

export function orderItemsLabel(items: OrderLineItem[]): string {
  if (!items?.length) return "";
  return items.map((i) => `${i.name} ×${i.quantity}`).join(", ");
}

export type AgentTraceStep = {
  tool: string;
  input?: string;
  output: string;
  status: "ok" | "miss";
  /** Tool call is still running (no result yet). */
  pending?: boolean;
};

/** Proof that an answer was grounded in retrieved KB chunks. */
export type RetrievalCitation = {
  filename: string;
  excerpt: string;
  rank: number;
  score: number;
};

/** Running conversation token + USD cost. */
export type ConversationUsage = {
  totalTokens: number;
  totalCostUsd: number;
};

export type ChatMessage = {
  id: string;
  role: "assistant" | "user" | "tool" | "system" | "debug";
  text: string;
  createdAt: string;
  /** Tool-calling trace for assistant messages (demo / simulated). */
  trace?: AgentTraceStep[];
  /** RAG citations when retrieve_knowledge returned chunks. */
  citations?: RetrievalCitation[];
  /** Assistant turn is still being produced. */
  streaming?: boolean;
  /** Dev-only label when VITE_SHOW_ALL_AGENT_MESSAGES is on. */
  debugKind?: string;
  toolName?: string;
  toolCallId?: string;
};

export type ChatThread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};
