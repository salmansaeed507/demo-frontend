import { useEffect, useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { EmbeddingStatus, KnowledgeDoc } from "../store/types";
import { useKnowledgeStore } from "../store/knowledgeStore";
import DomainLoadState from "./DomainLoadState";
import KnowledgeDocFormDialog from "./KnowledgeDocFormDialog";
import KnowledgeDocTableRow from "./KnowledgeDocListItem";
import PanelShell from "./PanelShell";

const STATUSES: EmbeddingStatus[] = [
  "ready",
  "pending",
  "indexing",
  "failed",
];

export default function RagPanel() {
  const knowledgeDocs = useKnowledgeStore((s) => s.knowledgeDocs);
  const status = useKnowledgeStore((s) => s.status);
  const error = useKnowledgeStore((s) => s.error);
  const load = useKnowledgeStore((s) => s.load);
  const updateDoc = useKnowledgeStore((s) => s.updateDoc);
  const reindexDoc = useKnowledgeStore((s) => s.reindexDoc);
  const [open, setOpen] = useState(false);
  const [reindexingId, setReindexingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | EmbeddingStatus>(
    "All",
  );

  useEffect(() => {
    void load();
  }, [load]);

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

  const counts = useMemo(() => {
    const next: Record<string, number> = { All: knowledgeDocs.length };
    for (const s of STATUSES) {
      next[s] = knowledgeDocs.filter((d) => d.embeddingStatus === s).length;
    }
    return next;
  }, [knowledgeDocs]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return knowledgeDocs.filter((d) => {
      const inStatus =
        statusFilter === "All" || d.embeddingStatus === statusFilter;
      const inQ =
        !q ||
        `${d.name} ${d.collection} ${d.type} ${d.tags.join(" ")}`
          .toLowerCase()
          .includes(q);
      return inStatus && inQ;
    });
  }, [knowledgeDocs, query, statusFilter]);

  const readyCount = counts.ready ?? 0;

  return (
    <PanelShell
      title="Knowledge base"
      description={
        status === "ready"
          ? `${readyCount} of ${knowledgeDocs.length} documents ready for retrieval.`
          : "Chunk, embed, and re-index docs for retrieval — not just a file list."
      }
      action={
        <Button
          size="sm"
          type="button"
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
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(["All", ...STATUSES] as const).map((s) => {
              const pressed = s === statusFilter;
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition-colors",
                    pressed
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-foreground hover:border-foreground/40",
                  )}
                >
                  {s}
                  <span
                    className={cn(
                      "ml-1",
                      pressed ? "opacity-70" : "text-muted-foreground",
                    )}
                  >
                    {counts[s] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents"
            aria-label="Search documents"
            className="w-full max-w-[280px]"
          />
        </div>

        <div className="mb-12 overflow-x-auto rounded-2xl border border-border bg-card">
          <Table className="min-w-[780px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {(
                  [
                    "Document",
                    "Collection",
                    "Type",
                    "Chunks",
                    "Status",
                    "Last indexed",
                    "",
                  ] as const
                ).map((label) => (
                  <TableHead
                    key={label || "actions"}
                    className="bg-foreground/[0.03] px-4 text-[0.86rem] font-semibold whitespace-nowrap text-muted-foreground"
                  >
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <td
                    colSpan={7}
                    className="px-4 py-7 text-muted-foreground"
                  >
                    No documents match. Try a different status or search.
                  </td>
                </TableRow>
              ) : (
                rows.map((doc) => (
                  <KnowledgeDocTableRow
                    key={doc.id}
                    doc={doc}
                    reindexingId={reindexingId}
                    onReindex={reindex}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DomainLoadState>

      <KnowledgeDocFormDialog open={open} onOpenChange={setOpen} />
    </PanelShell>
  );
}
