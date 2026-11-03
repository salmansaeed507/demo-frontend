import { create } from "zustand";
import type { KnowledgeDoc } from "./types";
import * as customerSupportApi from "../../api/customerSupport";
import { mapKnowledgeDoc } from "../../api/mappers";
import type { DomainLoadStatus } from "./loadStatus";

// Index state (status, chunk count, indexed time) is server-owned.
type DocFields = Pick<
  KnowledgeDoc,
  "name" | "type" | "sizeKb" | "uploadedAt" | "collection" | "tags" | "fileUrl"
>;
type DocInput = DocFields & { id?: string };

type KnowledgeState = {
  knowledgeDocs: KnowledgeDoc[];
  status: DomainLoadStatus;
  error: string | null;
  setKnowledgeDocs: (docs: KnowledgeDoc[]) => void;
  load: (opts?: { force?: boolean; silent?: boolean }) => Promise<void>;
  createDoc: (input: DocInput) => Promise<KnowledgeDoc>;
  updateDoc: (id: string, patch: Partial<DocFields>) => Promise<void>;
  deleteDoc: (id: string) => Promise<void>;
  reindexDoc: (id: string) => Promise<KnowledgeDoc>;
  indexSampleDoc: (filename: string) => Promise<KnowledgeDoc>;
};

let inflight: Promise<void> | null = null;

/** Sample docs use server ids `${userId}-doc-${filename}` (see rag/sample_docs.py). */
export function isSampleDoc(doc: KnowledgeDoc, filename: string): boolean {
  return doc.id.endsWith(`-doc-${filename}`);
}

export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  knowledgeDocs: [],
  status: "idle",
  error: null,
  setKnowledgeDocs: (knowledgeDocs) => set({ knowledgeDocs }),
  load: async (opts) => {
    const force = opts?.force ?? false;
    const silent = opts?.silent ?? false;
    const { status } = useKnowledgeStore.getState();
    if (!force && !silent && status === "ready") return;
    if (inflight) return inflight;

    if (!silent) set({ status: "loading", error: null });
    inflight = (async () => {
      try {
        const knowledgeDocs = (
          await customerSupportApi.listKnowledgeDocs()
        ).map(mapKnowledgeDoc);
        set({ knowledgeDocs, status: "ready", error: null });
      } catch (err) {
        if (!silent) {
          set({
            status: "error",
            error:
              err instanceof Error
                ? err.message
                : "Failed to load knowledge docs",
          });
        }
      } finally {
        inflight = null;
      }
    })();
    return inflight;
  },
  createDoc: async (input) => {
    const created = mapKnowledgeDoc(
      await customerSupportApi.createKnowledgeDoc({
        id: input.id,
        name: input.name,
        type: input.type,
        sizeKb: input.sizeKb,
        uploadedAt: input.uploadedAt,
        collection: input.collection,
        tags: input.tags,
        fileUrl: input.fileUrl,
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
        uploadedAt: patch.uploadedAt,
        collection: patch.collection,
        tags: patch.tags,
        fileUrl: patch.fileUrl,
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
  indexSampleDoc: async (filename) => {
    // Show it as "indexing" immediately, before the request even resolves.
    set((s) => {
      const existing = s.knowledgeDocs.find((d) => isSampleDoc(d, filename));
      const optimistic: KnowledgeDoc = existing
        ? { ...existing, embeddingStatus: "indexing", indexed: false }
        : {
            id: `pending-doc-${filename}`,
            name: filename,
            type: "",
            sizeKb: 0,
            indexed: false,
            uploadedAt: new Date().toISOString().slice(0, 10),
            chunkCount: 0,
            lastIndexedAt: null,
            embeddingStatus: "indexing",
            collection: "",
            tags: [],
            fileUrl: "",
          };
      return {
        knowledgeDocs: existing
          ? s.knowledgeDocs.map((d) => (d.id === existing.id ? optimistic : d))
          : [optimistic, ...s.knowledgeDocs],
        status: "ready",
      };
    });

    try {
      const updated = mapKnowledgeDoc(
        await customerSupportApi.indexSampleKnowledgeDoc(filename),
      );
      set((s) => ({
        knowledgeDocs: [
          updated,
          ...s.knowledgeDocs.filter((d) => !isSampleDoc(d, filename)),
        ],
      }));
      return updated;
    } catch (err) {
      // Drop the optimistic row; the server's state (e.g. "failed") wins.
      set((s) => ({
        knowledgeDocs: s.knowledgeDocs.filter(
          (d) => d.id !== `pending-doc-${filename}`,
        ),
      }));
      void useKnowledgeStore.getState().load({ force: true, silent: true });
      throw err;
    }
  },
}));
