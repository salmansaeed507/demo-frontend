import type {
  ApiChatMessage,
  ApiChatThread,
  ApiCitation,
  ApiKnowledgeDoc,
  ApiOrder,
  ApiOrderItem,
  ApiProduct,
  ApiTicket,
  ApiTraceStep,
} from "./customerSupport";
import type { Product } from "../customer-support/mock/products";
import type {
  ChatMessage,
  ChatThread,
  KnowledgeDoc,
  Order,
  OrderLineItem,
  RetrievalCitation,
  SupportTicket,
  AgentTraceStep,
} from "../customer-support/store/types";
import { orderItemsLabel } from "../customer-support/store/types";

export function formatCreatedAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "just now";
  const sec = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (sec < 45) return "just now";
  if (sec < 3600) return `${Math.max(1, Math.round(sec / 60))}m ago`;
  if (sec < 86400) return `${Math.max(1, Math.round(sec / 3600))}h ago`;
  const days = Math.max(1, Math.round(sec / 86400));
  return `${days}d ago`;
}

export function formatOrderItems(items: ApiOrderItem[]): string {
  return orderItemsLabel(
    (items ?? []).map((i) => ({
      id: i.id,
      productId: i.productId,
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
  );
}

export function mapOrderItems(items: ApiOrderItem[]): OrderLineItem[] {
  return (items ?? []).map((i) => ({
    id: i.id,
    productId: i.productId,
    name: i.name,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
  }));
}

export function toApiOrderItems(items: OrderLineItem[]) {
  return items.map((i) => ({
    id: i.id,
    productId: i.productId,
    name: i.name,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
  }));
}

export function mapProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    description: p.description,
    stock: p.stock,
    imageUrl: p.imageUrl,
  };
}

export function mapTicket(t: ApiTicket): SupportTicket {
  return {
    id: t.id,
    customer: t.customer,
    summary: t.summary,
    conversationId: t.conversationId,
    priority: t.priority,
    status: t.status,
    createdAgo: formatCreatedAgo(t.created),
  };
}

export function mapOrder(o: ApiOrder): Order {
  return {
    id: o.id,
    customer: o.customer,
    email: o.email,
    phone: o.phone,
    shippingAddress: o.shippingAddress,
    items: mapOrderItems(o.items),
    total: o.total,
    status: o.status,
    shippingMethod: o.shippingMethod,
    carrier: o.carrier,
    trackingNumber: o.trackingNumber,
    paymentMethod: o.paymentMethod,
    placedAt: o.placedAt,
  };
}

export function mapKnowledgeDoc(d: ApiKnowledgeDoc): KnowledgeDoc {
  return {
    id: d.id,
    name: d.name,
    type: d.type,
    sizeKb: d.sizeKb,
    indexed: d.indexed,
    uploadedAt: d.uploadedAt,
    chunkCount: d.chunkCount,
    lastIndexedAt: d.lastIndexedAt,
    embeddingStatus: d.embeddingStatus,
    collection: d.collection,
    tags: d.tags ?? [],
  };
}

export function mapTrace(steps: ApiTraceStep[] | null | undefined): AgentTraceStep[] {
  if (!steps) return [];
  return steps.map((s) => ({
    tool: s.tool,
    input: s.input ?? undefined,
    output: s.output,
    status: s.status,
  }));
}

export function mapCitations(
  citations: ApiCitation[] | null | undefined,
): RetrievalCitation[] | undefined {
  if (!citations?.length) return undefined;
  return citations.map((c) => ({
    filename: c.filename,
    excerpt: c.excerpt,
    rank: c.rank,
    score: c.score,
  }));
}

export function mapMessage(m: ApiChatMessage): ChatMessage {
  return {
    id: m.id,
    role: m.role,
    text: m.text,
    createdAt: m.createdAt,
    trace: m.trace ? mapTrace(m.trace) : undefined,
    citations: mapCitations(m.citations),
  };
}

export function mapThread(t: ApiChatThread): ChatThread {
  return {
    id: t.id,
    title: t.title,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    messages: (t.messages ?? []).map(mapMessage),
  };
}

