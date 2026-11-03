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
  fileUrl: string;
};
