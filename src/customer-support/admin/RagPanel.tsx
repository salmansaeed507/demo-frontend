import { useEffect, useMemo, useState } from "react";
import { FileCode2, FileText, Loader2, RefreshCw, Upload, X } from "lucide-react";
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
import {
  listSampleKnowledgeDocs,
  type ApiSampleDoc,
} from "@/api/customerSupport";
import type { EmbeddingStatus, KnowledgeDoc } from "../store/types";
import { isSampleDoc, useKnowledgeStore } from "../store/knowledgeStore";
import DomainLoadState from "./DomainLoadState";
import KnowledgeChunksDialog from "./KnowledgeChunksDialog";
import KnowledgeDocFormDialog from "./KnowledgeDocFormDialog";
import KnowledgeDocTableRow from "./KnowledgeDocListItem";
import PanelShell from "./PanelShell";

const STATUSES: EmbeddingStatus[] = [
  "ready",
  "pending",
  "indexing",
  "failed",
];

function fileIconFor(filename: string) {
  return filename.endsWith(".md") ? FileCode2 : FileText;
}

export default function RagPanel() {
  const knowledgeDocs = useKnowledgeStore((s) => s.knowledgeDocs);
  const status = useKnowledgeStore((s) => s.status);
  const error = useKnowledgeStore((s) => s.error);
  const load = useKnowledgeStore((s) => s.load);
  const reindexDoc = useKnowledgeStore((s) => s.reindexDoc);
  const indexSampleDoc = useKnowledgeStore((s) => s.indexSampleDoc);
  const [open, setOpen] = useState(false);
  const [reindexingId, setReindexingId] = useState<string | null>(null);
  const [indexingFilename, setIndexingFilename] = useState<string | null>(
    null,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sampleDocs, setSampleDocs] = useState<ApiSampleDoc[]>([]);
  const [chunksDoc, setChunksDoc] = useState<KnowledgeDoc | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | EmbeddingStatus>(
    "All",
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    listSampleKnowledgeDocs()
      .then((docs) => {
        if (!cancelled) setSampleDocs(docs);
      })
      .catch((err) => console.error("Failed to load sample documents", err));
    return () => {
      cancelled = true;
    };
  }, []);

  const hasIndexing = useMemo(
    () => knowledgeDocs.some((d) => d.embeddingStatus === "indexing"),
    [knowledgeDocs],
  );

  useEffect(() => {
    if (!hasIndexing) return;
    const interval = setInterval(() => {
      void load({ force: true, silent: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [hasIndexing, load]);

  async function refresh() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await load({ force: true, silent: true });
    } finally {
      setRefreshing(false);
    }
  }

  function reportActionError(prefix: string, err: unknown) {
    const detail = err instanceof Error ? err.message : "Unknown error";
    setActionError(`${prefix}: ${detail}`);
  }

  async function reindex(doc: KnowledgeDoc) {
    if (reindexingId || doc.embeddingStatus === "indexing") return;
    setReindexingId(doc.id);
    setActionError(null);
    try {
      // Returns immediately with indexing — no spinner while worker runs.
      await reindexDoc(doc.id);
    } catch (err) {
      reportActionError(`Couldn't re-index ${doc.name}`, err);
      // The server may have marked the doc failed; show its real state.
      void load({ force: true, silent: true });
    } finally {
      setReindexingId(null);
    }
  }

  async function indexSample(filename: string) {
    if (indexingFilename) return;
    setIndexingFilename(filename);
    setActionError(null);
    try {
      await indexSampleDoc(filename);
    } catch (err) {
      reportActionError(`Couldn't index ${filename}`, err);
    } finally {
      setIndexingFilename(null);
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
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={() => void refresh()}
            disabled={status === "loading" || refreshing}
            aria-label="Refresh documents"
          >
            <RefreshCw
              className={cn("size-3.5", refreshing && "animate-spin")}
            />
            Refresh
          </Button>
          <Button
            size="sm"
            type="button"
            onClick={() => setOpen(true)}
            disabled={status !== "ready"}
          >
            <Upload data-icon="inline-start" />
            Add document
          </Button>
        </div>
      }
    >
      <DomainLoadState
        status={status}
        error={error}
        onRetry={() => void load({ force: true })}
      >
        {actionError ? (
          <div
            role="alert"
            className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
          >
            <span>{actionError}</span>
            <button
              type="button"
              onClick={() => setActionError(null)}
              aria-label="Dismiss error"
              className="shrink-0 rounded-md opacity-70 hover:opacity-100"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : null}
        <div className="mb-6">
          <h2 className="font-heading text-[1.15rem] tracking-tight text-foreground">
            Sample documents
          </h2>
          <p className="mt-0.5 text-[0.88rem] text-muted-foreground">
            Download a file, or index it straight into the knowledge base.
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {sampleDocs.map((doc) => {
              const Icon = fileIconFor(doc.filename);
              const seeded = knowledgeDocs.find((d) =>
                isSampleDoc(d, doc.filename),
              );
              const failed = seeded?.embeddingStatus === "failed";
              const pending =
                indexingFilename === doc.filename ||
                seeded?.embeddingStatus === "indexing";

              return (
                <div
                  key={doc.filename}
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted px-3.5 py-2.5"
                >
                  <Icon className="size-5 shrink-0 text-muted-foreground" />
                  <a
                    href={`/sample-docs/${doc.filename}`}
                    download
                    className="text-sm font-medium text-foreground hover:underline"
                  >
                    {doc.filename}
                  </a>
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    className="ml-2 h-auto px-2.5 py-1 text-xs"
                    onClick={() => void indexSample(doc.filename)}
                    disabled={pending}
                  >
                    {pending && <Loader2 className="size-3 animate-spin" />}
                    {pending
                      ? "Indexing"
                      : failed
                        ? "Retry"
                        : seeded
                          ? "Re-index"
                          : "Index"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

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
                    reindexPending={reindexingId === doc.id}
                    onReindex={reindex}
                    onOpenChunks={setChunksDoc}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DomainLoadState>

      <KnowledgeDocFormDialog open={open} onOpenChange={setOpen} />
      <KnowledgeChunksDialog
        doc={chunksDoc}
        open={chunksDoc != null}
        onOpenChange={(next) => {
          if (!next) setChunksDoc(null);
        }}
      />
    </PanelShell>
  );
}
