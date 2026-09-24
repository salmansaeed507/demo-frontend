import { useEffect, useState } from "react";
import { BookOpen, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { KnowledgeDoc } from "../store/types";
import { useKnowledgeStore } from "../store/knowledgeStore";
import DomainLoadState from "./DomainLoadState";
import KnowledgeDocFormDialog from "./KnowledgeDocFormDialog";
import KnowledgeDocListItem from "./KnowledgeDocListItem";
import PanelShell from "./PanelShell";

export default function RagPanel() {
  const knowledgeDocs = useKnowledgeStore((s) => s.knowledgeDocs);
  const status = useKnowledgeStore((s) => s.status);
  const error = useKnowledgeStore((s) => s.error);
  const load = useKnowledgeStore((s) => s.load);
  const updateDoc = useKnowledgeStore((s) => s.updateDoc);
  const reindexDoc = useKnowledgeStore((s) => s.reindexDoc);
  const [open, setOpen] = useState(false);
  const [reindexingId, setReindexingId] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  const totalChunks = knowledgeDocs.reduce((sum, d) => sum + d.chunkCount, 0);
  const readyCount = knowledgeDocs.filter(
    (d) => d.embeddingStatus === "ready",
  ).length;

  async function reindex(doc: KnowledgeDoc) {
    if (reindexingId) return;
    setReindexingId(doc.id);
    try {
      await updateDoc(doc.id, {
        embeddingStatus: "indexing",
        indexed: false,
      });
      await reindexDoc(doc.id);
    } finally {
      setReindexingId(null);
    }
  }

  return (
    <PanelShell
      icon={BookOpen}
      title="Knowledge base"
      description="Chunk, embed, and re-index docs for retrieval — not just a file list."
      stats={[
        { label: "Ready", value: `${readyCount}/${knowledgeDocs.length}` },
        { label: "Chunks", value: totalChunks },
        {
          label: "Collections",
          value: new Set(knowledgeDocs.map((d) => d.collection)).size,
        },
      ]}
      action={
        <Button
          size="sm"
          type="button"
          className="bg-teal-800 text-white hover:bg-teal-700"
          onClick={() => setOpen(true)}
          disabled={status !== "ready"}
        >
          <Upload data-icon="inline-start" />
          Add document
        </Button>
      }
    >
      <DomainLoadState
        status={status}
        error={error}
        onRetry={() => void load({ force: true })}
        loadingLabel="Loading knowledge base…"
      >
        <ul className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm shadow-zinc-900/[0.03]">
          {knowledgeDocs.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-slate-400">
              No documents yet. Add one to seed the knowledge base.
            </li>
          ) : (
            knowledgeDocs.map((doc) => (
              <KnowledgeDocListItem
                key={doc.id}
                doc={doc}
                reindexingId={reindexingId}
                onReindex={reindex}
              />
            ))
          )}
        </ul>
      </DomainLoadState>

      <KnowledgeDocFormDialog open={open} onOpenChange={setOpen} />
    </PanelShell>
  );
}
