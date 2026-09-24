import { FileText, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EmbeddingStatus, KnowledgeDoc } from "../store/types";
import { useKnowledgeStore } from "../store/knowledgeStore";

function statusBadge(status: EmbeddingStatus) {
  if (status === "ready")
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "indexing") return "border-sky-200 bg-sky-50 text-sky-800";
  if (status === "failed") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-amber-200 bg-amber-50 text-amber-800";
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

  return (
    <li className="border-b border-zinc-100 px-4 py-3.5 text-sm last:border-b-0">
      <div className="flex flex-wrap items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-900/[0.06] text-teal-800">
          <FileText className="size-4" />
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-medium text-slate-900">{doc.name}</p>
            <Badge
              variant="outline"
              className={cn("capitalize", statusBadge(doc.embeddingStatus))}
            >
              {doc.embeddingStatus}
            </Badge>
            <span className="rounded-md bg-teal-900/[0.06] px-1.5 py-0.5 text-[11px] font-medium text-teal-900/80">
              {doc.collection}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {doc.type} · {doc.sizeKb} KB · uploaded {doc.uploadedAt}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            <span>
              <span className="text-slate-400">Chunks</span>{" "}
              <span className="font-semibold tabular-nums">{doc.chunkCount}</span>
            </span>
            <span>
              <span className="text-slate-400">Last indexed</span>{" "}
              <span className="font-medium">
                {formatIndexedAt(doc.lastIndexedAt)}
              </span>
            </span>
          </div>
          {doc.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {doc.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-slate-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-0.5 sm:gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            aria-label={
              reindexingId === doc.id || doc.embeddingStatus === "indexing"
                ? "Indexing"
                : "Re-index"
            }
            disabled={
              reindexingId === doc.id || doc.embeddingStatus === "indexing"
            }
            onClick={() => onReindex(doc)}
          >
            <RefreshCw
              className={cn(
                "size-3.5",
                (reindexingId === doc.id ||
                  doc.embeddingStatus === "indexing") &&
                  "animate-spin",
              )}
            />
            <span className="ml-1.5 hidden sm:inline">
              {reindexingId === doc.id || doc.embeddingStatus === "indexing"
                ? "Indexing…"
                : "Re-index"}
            </span>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8 text-rose-600 hover:text-rose-700"
            aria-label="Delete"
            onClick={() => {
              if (
                confirm(
                  `Remove “${doc.name}” from the knowledge base?\n\nIt will no longer be retrieved for agent answers until you add it again.`,
                )
              ) {
                void deleteDoc(doc.id);
              }
            }}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </li>
  );
}
