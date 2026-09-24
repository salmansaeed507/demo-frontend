import { customerSupportApiClient } from "./client";

export type ApiProduct = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  imageUrl: string;
};

export type ApiTicket = {
  id: string;
  customer: string;
  summary: string;
  conversationId: string;
  priority: "high" | "medium" | "low";
  status: "open" | "pending" | "resolved";
  created: string;
};

export type ApiOrderItem = {
  id: string;
  productId: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type ApiOrder = {
  id: string;
  customer: string;
  email: string;
  phone: string;
  shippingAddress: string;
  items: ApiOrderItem[];
  total: number;
  status:
    | "processing"
    | "out_for_delivery"
    | "delivered"
    | "refunded"
    | "cancelled";
  shippingMethod: string;
  carrier: string;
  trackingNumber: string;
  paymentMethod: string;
  placedAt: string;
};

export type ApiKnowledgeDoc = {
  id: string;
  name: string;
  type: string;
  sizeKb: number;
  indexed: boolean;
  uploadedAt: string;
  chunkCount: number;
  lastIndexedAt: string | null;
  embeddingStatus: "ready" | "pending" | "indexing" | "failed";
  collection: string;
  tags: string[];
};

export type ApiTraceStep = {
  tool: string;
  input?: string | null;
  output: string;
  status: "ok" | "miss";
};

export type ApiCitation = {
  filename: string;
  excerpt: string;
  rank: number;
  score: number;
};

export type ApiChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  createdAt: string;
  trace?: ApiTraceStep[] | null;
  citations?: ApiCitation[] | null;
};

export type ApiChatThread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ApiChatMessage[];
};

export type ApiAgentTurnResponse = {
  threadId: string;
  userMessage: ApiChatMessage;
  assistantMessage: ApiChatMessage;
  ticket: ApiTicket | null;
};

function jsonBody(data: unknown): RequestInit {
  return {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
}

/**
 * Product APIs: list, create, update, delete
 */
export const listProducts = () =>
  customerSupportApiClient.fetch<ApiProduct[]>("/products");

export const createProduct = (body: Record<string, unknown>) =>
  customerSupportApiClient.fetch<ApiProduct>("/products", {
    method: "POST",
    ...jsonBody(body),
  });

export const updateProduct = (id: string, body: Record<string, unknown>) =>
  customerSupportApiClient.fetch<ApiProduct>(
    `/products/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      ...jsonBody(body),
    },
  );

export const deleteProduct = (id: string) =>
  customerSupportApiClient.fetch<void>(
    `/products/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );

/**
 * Ticket APIs: list, create, update, delete
 */
export const listTickets = () =>
  customerSupportApiClient.fetch<ApiTicket[]>("/tickets");

export const createTicket = (body: Record<string, unknown>) =>
  customerSupportApiClient.fetch<ApiTicket>("/tickets", {
    method: "POST",
    ...jsonBody(body),
  });

export const updateTicket = (id: string, body: Record<string, unknown>) =>
  customerSupportApiClient.fetch<ApiTicket>(
    `/tickets/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      ...jsonBody(body),
    },
  );

export const deleteTicket = (id: string) =>
  customerSupportApiClient.fetch<void>(`/tickets/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

/**
 * Order APIs: list, create, update, delete
 */
export const listOrders = () =>
  customerSupportApiClient.fetch<ApiOrder[]>("/orders");

export const createOrder = (body: Record<string, unknown>) =>
  customerSupportApiClient.fetch<ApiOrder>("/orders", {
    method: "POST",
    ...jsonBody(body),
  });

export const updateOrder = (id: string, body: Record<string, unknown>) =>
  customerSupportApiClient.fetch<ApiOrder>(
    `/orders/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      ...jsonBody(body),
    },
  );

export const deleteOrder = (id: string) =>
  customerSupportApiClient.fetch<void>(`/orders/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

export const checkout = (body: Record<string, unknown>) =>
  customerSupportApiClient.fetch<ApiOrder>("/checkout", {
    method: "POST",
    ...jsonBody(body),
  });

/**
 * Knowledge APIs: list, create, update, delete
 */
export const listKnowledgeDocs = () =>
  customerSupportApiClient.fetch<ApiKnowledgeDoc[]>("/knowledge-docs");

export const createKnowledgeDoc = (body: Record<string, unknown>) =>
  customerSupportApiClient.fetch<ApiKnowledgeDoc>("/knowledge-docs", {
    method: "POST",
    ...jsonBody(body),
  });

export const updateKnowledgeDoc = (id: string, body: Record<string, unknown>) =>
  customerSupportApiClient.fetch<ApiKnowledgeDoc>(
    `/knowledge-docs/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      ...jsonBody(body),
    },
  );

export const deleteKnowledgeDoc = (id: string) =>
  customerSupportApiClient.fetch<void>(
    `/knowledge-docs/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );

export const reindexKnowledgeDoc = (id: string) =>
  customerSupportApiClient.fetch<ApiKnowledgeDoc>(
    `/knowledge-docs/${encodeURIComponent(id)}/reindex`,
    { method: "POST" },
  );

/**
 * Chat APIs: list, create, update, delete
 */
export const listChatThreads = () =>
  customerSupportApiClient.fetch<ApiChatThread[]>("/chat/threads");

export const createChatThread = (body: Record<string, unknown> = {}) =>
  customerSupportApiClient.fetch<ApiChatThread>("/chat/threads", {
    method: "POST",
    ...jsonBody(body),
  });

export const updateChatThread = (id: string, body: Record<string, unknown>) =>
  customerSupportApiClient.fetch<ApiChatThread>(
    `/chat/threads/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      ...jsonBody(body),
    },
  );

export const deleteChatThread = (id: string) =>
  customerSupportApiClient.fetch<void>(
    `/chat/threads/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );

export const clearChatThread = (id: string) =>
  customerSupportApiClient.fetch<ApiChatThread>(
    `/chat/threads/${encodeURIComponent(id)}/clear`,
    { method: "POST" },
  );

/**
 * Agent APIs: turn
 */
export const agentTurn = (body: { text: string; threadId?: string | null }) =>
  customerSupportApiClient.fetch<ApiAgentTurnResponse>("/agent/turn", {
    method: "POST",
    ...jsonBody(body),
  });
