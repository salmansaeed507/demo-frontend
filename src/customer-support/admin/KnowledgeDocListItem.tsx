import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { EmbeddingStatus, KnowledgeDoc } from "../store/types";
import { useKnowledgeStore } from "../store/knowledgeStore";

function statusBadgeClass(status: EmbeddingStatus) {
  if (status === "ready") return "bg-ok/18 text-ok";
  if (status === "indexing") return "bg-info/18 text-info";
  if (status === "failed") return "bg-destructive/18 text-destructive";
  return "bg-ring/20 text-ring";
}

function formatIndexedAt(iso: string | null) {
  if (!iso) return "Never";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  doc: KnowledgeDoc;
  reindexingId: string | null;
  onReindex: (doc: KnowledgeDoc) => void;
};

export default function KnowledgeDocListItem({
  doc,
  reindexingId,
  onReindex,
}: Props) {
  const deleteDoc = useKnowledgeStore((s) => s.deleteDoc);
  const [deleting, setDeleting] = useState(false);
  const reindexing =
    reindexingId === doc.id || doc.embeddingStatus === "indexing";
  const busy = reindexing || deleting;

  async function onDelete() {
    if (busy) return;
    setDeleting(true);
    try {
      await deleteDoc(doc.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <TableRow>
      <TableCell className="px-4 py-3">
        <div className="min-w-0">
          <div className="truncate font-semibold text-foreground">{doc.name}</div>
          <div className="truncate text-[0.84rem] text-muted-foreground">
            {doc.sizeKb} KB · uploaded {doc.uploadedAt}
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-[0.94rem]">{doc.collection}</TableCell>
      <TableCell className="px-4 py-3 text-[0.94rem] uppercase text-muted-foreground">
        {doc.type}
      </TableCell>
      <TableCell className="px-4 py-3 text-[0.94rem] tabular-nums">
        {doc.chunkCount}
      </TableCell>
      <TableCell className="px-4 py-3">
        <span
          className={cn(
            "inline-block rounded-full px-2.5 py-0.5 text-[0.82rem] font-semibold capitalize",
            statusBadgeClass(doc.embeddingStatus),
          )}
        >
          {doc.embeddingStatus}
        </span>
      </TableCell>
      <TableCell className="px-4 py-3 text-[0.94rem] whitespace-nowrap text-muted-foreground">
        {formatIndexedAt(doc.lastIndexedAt)}
      </TableCell>
      <TableCell className="px-4 py-3">
        <div className="flex justify-end gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => onReindex(doc)}
          >
            <RefreshCw
              className={cn("size-3.5", reindexing && "animate-spin")}
            />
            {reindexing ? "Indexing…" : "Re-index"}
          </Button>
          <ConfirmDialog
            title="Remove document"
            description={`Remove “${doc.name}” from the knowledge base? It will no longer be retrieved for agent answers until you add it again.`}
            confirmLabel="Remove"
            pending={deleting}
            onConfirm={onDelete}
            trigger={
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={busy}
              >
                {deleting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
            }
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
