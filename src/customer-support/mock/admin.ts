export type Conversation = {
  id: string;
  customer: string;
  preview: string;
  status: "active" | "resolved" | "escalated";
  updatedAt: string;
  messageCount: number;
};

export type SupportTicket = {
  id: string;
  customer: string;
  summary: string;
  conversationId: string;
  priority: "high" | "medium" | "low";
  status: "open" | "pending" | "resolved";
  createdAgo: string;
};

export type EmbeddingStatus = "ready" | "pending" | "indexing" | "failed";

export type KnowledgeDoc = {
  id: string;
  name: string;
  type: string;
  sizeKb: number;
  /** Convenience: true when embeddingStatus === "ready" */
  indexed: boolean;
  uploadedAt: string;
  chunkCount: number;
  lastIndexedAt: string | null;
  embeddingStatus: EmbeddingStatus;
  collection: string;
  tags: string[];
};

export const conversations: Conversation[] = [
  {
    id: "conv-101",
    customer: "Alex Rivera",
    preview: "Where is my order #48291?",
    status: "resolved",
    updatedAt: "2026-09-02 14:22",
    messageCount: 4,
  },
  {
    id: "conv-102",
    customer: "Jordan Lee",
    preview: "What's your return policy for opened items?",
    status: "active",
    updatedAt: "2026-09-02 15:01",
    messageCount: 3,
  },
  {
    id: "conv-103",
    customer: "Sam Chen",
    preview: "I was charged twice for the backpack.",
    status: "escalated",
    updatedAt: "2026-09-02 13:40",
    messageCount: 6,
  },
];

export const tickets: SupportTicket[] = [
  {
    id: "TCK-1042",
    customer: "Sara Khan",
    summary: "Order #48291 delayed — refund not received after 7 days",
    conversationId: "conv-110",
    priority: "high",
    status: "open",
    createdAgo: "10m ago",
  },
  {
    id: "TCK-1040",
    customer: "Sam Chen",
    summary: "Duplicate charge on order #48288 — needs billing review",
    conversationId: "conv-103",
    priority: "high",
    status: "open",
    createdAgo: "1h ago",
  },
  {
    id: "TCK-1039",
    customer: "Ali Raza",
    summary: "Wants invoice copy for corporate expense report",
    conversationId: "conv-099",
    priority: "low",
    status: "resolved",
    createdAgo: "3h ago",
  },
  {
    id: "TCK-1035",
    customer: "Morgan Blake",
    summary: "Damaged LED lamp on arrival — replacement requested",
    conversationId: "conv-098",
    priority: "medium",
    status: "pending",
    createdAgo: "1d ago",
  },
  {
    id: "TCK-1031",
    customer: "Alex Rivera",
    summary: "Asked for human help after shipping delay (AI escalated)",
    conversationId: "conv-101",
    priority: "medium",
    status: "resolved",
    createdAgo: "2d ago",
  },
];

export const knowledgeDocs: KnowledgeDoc[] = [
  {
    id: "doc-1",
    name: "shipping-policy.pdf",
    type: "PDF",
    sizeKb: 240,
    indexed: true,
    uploadedAt: "2026-08-20",
    chunkCount: 48,
    lastIndexedAt: "2026-09-02T14:10:00.000Z",
    embeddingStatus: "ready",
    collection: "policies",
    tags: ["shipping", "fulfillment"],
  },
  {
    id: "doc-2",
    name: "returns-and-refunds.md",
    type: "Markdown",
    sizeKb: 18,
    indexed: true,
    uploadedAt: "2026-08-22",
    chunkCount: 22,
    lastIndexedAt: "2026-09-08T09:42:00.000Z",
    embeddingStatus: "ready",
    collection: "policies",
    tags: ["returns", "refunds"],
  },
  {
    id: "doc-3",
    name: "product-faq.docx",
    type: "Word",
    sizeKb: 96,
    indexed: false,
    uploadedAt: "2026-09-01",
    chunkCount: 0,
    lastIndexedAt: null,
    embeddingStatus: "pending",
    collection: "catalog",
    tags: ["faq", "products"],
  },
  {
    id: "doc-4",
    name: "warranty-guide.pdf",
    type: "PDF",
    sizeKb: 64,
    indexed: true,
    uploadedAt: "2026-09-01",
    chunkCount: 31,
    lastIndexedAt: "2026-09-01T18:05:00.000Z",
    embeddingStatus: "ready",
    collection: "policies",
    tags: ["warranty"],
  },
];

export const analytics = {
  conversationsToday: 128,
  conversationsTrend: "+12%",
  aiResolvedRate: 84,
  aiResolvedTrend: "+3%",
  openTickets: 7,
  openTicketsTrend: "-2",
  kbDocuments: 4,
  kbChunks: 397,
  ticketsCreated: 6,
  avgResponseSeconds: 4.2,
  topIntents: [
    { label: "Order status", count: 11 },
    { label: "Returns", count: 7 },
    { label: "Shipping", count: 5 },
    { label: "Other / escalate", count: 5 },
  ],
};
