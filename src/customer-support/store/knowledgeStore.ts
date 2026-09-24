import { create } from "zustand";
import type { KnowledgeDoc } from "./types";
import * as customerSupportApi from "../../api/customerSupport";
import { mapKnowledgeDoc } from "../../api/mappers";
import type { DomainLoadStatus } from "./loadStatus";

type DocInput = Omit<KnowledgeDoc, "id"> & { id?: string };

type KnowledgeState = {
  knowledgeDocs: KnowledgeDoc[];
  status: DomainLoadStatus;
  error: string | null;
  setKnowledgeDocs: (docs: KnowledgeDoc[]) => void;
  load: (opts?: { force?: boolean }) => Promise<void>;
  createDoc: (input: DocInput) => Promise<KnowledgeDoc>;
  updateDoc: (id: string, patch: Partial<KnowledgeDoc>) => Promise<void>;
  deleteDoc: (id: string) => Promise<void>;
  reindexDoc: (id: string) => Promise<KnowledgeDoc>;
};

let inflight: Promise<void> | null = null;

export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  knowledgeDocs: [],
  status: "idle",
  error: null,
  setKnowledgeDocs: (knowledgeDocs) => set({ knowledgeDocs }),
  load: async (opts) => {
    const force = opts?.force ?? false;
    const { status } = useKnowledgeStore.getState();
    if (!force && status === "ready") return;
    if (inflight) return inflight;

    set({ status: "loading", error: null });
    inflight = (async () => {
      try {
        const knowledgeDocs = (
          await customerSupportApi.listKnowledgeDocs()
        ).map(mapKnowledgeDoc);
        set({ knowledgeDocs, status: "ready", error: null });
      } catch (err) {
        set({
          status: "error",
          error:
            err instanceof Error
              ? err.message
              : "Failed to load knowledge docs",
        });
      } finally {
        inflight = null;
      }
    })();
    return inflight;
  },
  createDoc: async (input) => {
    const status = input.embeddingStatus ?? (input.indexed ? "ready" : "pending");
    const created = mapKnowledgeDoc(
      await customerSupportApi.createKnowledgeDoc({
        id: input.id,
        name: input.name,
        type: input.type,
        sizeKb: input.sizeKb,
        embeddingStatus: status,
        indexed: status === "ready",
        uploadedAt: input.uploadedAt,
        chunkCount: input.chunkCount,
        lastIndexedAt: input.lastIndexedAt,
        collection: input.collection,
        tags: input.tags,
      }),
    );
    set((s) => ({
      knowledgeDocs: [created, ...s.knowledgeDocs],
      status: "ready",
    }));
    return created;
  },
  updateDoc: async (id, patch) => {
    const updated = mapKnowledgeDoc(
      await customerSupportApi.updateKnowledgeDoc(id, {
        name: patch.name,
        type: patch.type,
        sizeKb: patch.sizeKb,
        embeddingStatus: patch.embeddingStatus,
        indexed: patch.indexed,
        uploadedAt: patch.uploadedAt,
        chunkCount: patch.chunkCount,
        lastIndexedAt: patch.lastIndexedAt,
        collection: patch.collection,
        tags: patch.tags,
      }),
    );
    set((s) => ({
      knowledgeDocs: s.knowledgeDocs.map((d) => (d.id === id ? updated : d)),
    }));
  },
  deleteDoc: async (id) => {
    await customerSupportApi.deleteKnowledgeDoc(id);
    set((s) => ({
      knowledgeDocs: s.knowledgeDocs.filter((d) => d.id !== id),
    }));
  },
  reindexDoc: async (id) => {
    const updated = mapKnowledgeDoc(
      await customerSupportApi.reindexKnowledgeDoc(id),
    );
    set((s) => ({
      knowledgeDocs: s.knowledgeDocs.map((d) => (d.id === id ? updated : d)),
    }));
    return updated;
  },
}));
