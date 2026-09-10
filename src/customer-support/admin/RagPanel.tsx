import { FormEvent, useState } from "react";
import { BookOpen, FileText, RefreshCw, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  useShopPilot,
  type EmbeddingStatus,
  type KnowledgeDoc,
} from "../store/ShopPilotStore";
import PanelShell from "./PanelShell";
import { fieldClass } from "./styles";

type FormState = {
  name: string;
  type: string;
  sizeKb: string;
  collection: string;
  tags: string;
  embeddingStatus: EmbeddingStatus;
  chunkCount: string;
};

const empty: FormState = {
  name: "",
  type: "PDF",
  sizeKb: "32",
  collection: "policies",
  tags: "",
  embeddingStatus: "pending",
  chunkCount: "0",
};

function statusBadge(status: EmbeddingStatus) {
  if (status === "ready")
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "indexing")
    return "border-sky-200 bg-sky-50 text-sky-800";
  if (status === "failed")
    return "border-rose-200 bg-rose-50 text-rose-700";
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

export default function RagPanel() {
  const { knowledgeDocs, createDoc, updateDoc, deleteDoc } = useShopPilot();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [reindexingId, setReindexingId] = useState<string | null>(null);

  const totalChunks = knowledgeDocs.reduce((sum, d) => sum + d.chunkCount, 0);
  const readyCount = knowledgeDocs.filter(
    (d) => d.embeddingStatus === "ready",
  ).length;

  function openCreate() {
    setForm(empty);
    setOpen(true);
  }

  function parseTags(raw: string) {
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const status = form.embeddingStatus;
    const sizeKb = Number(form.sizeKb) || 0;
    const chunkCount =
      status === "ready"
        ? Number(form.chunkCount) || Math.max(4, Math.round(sizeKb / 4))
        : Number(form.chunkCount) || 0;

    const payload: Omit<KnowledgeDoc, "id"> = {
      name: form.name.trim(),
      type: form.type.trim() || "PDF",
      sizeKb,
      embeddingStatus: status,
      indexed: status === "ready",
      uploadedAt: new Date().toISOString().slice(0, 10),
      chunkCount,
      lastIndexedAt: status === "ready" ? new Date().toISOString() : null,
      collection: form.collection.trim() || "support",
      tags: parseTags(form.tags),
    };
    if (!payload.name) return;
    createDoc(payload);
    setOpen(false);
  }

  function reindex(doc: KnowledgeDoc) {
    if (reindexingId) return;
    setReindexingId(doc.id);
    updateDoc(doc.id, {
      embeddingStatus: "indexing",
      indexed: false,
    });
    window.setTimeout(() => {
      const chunks =
        doc.chunkCount > 0
          ? doc.chunkCount + Math.floor(Math.random() * 3)
          : Math.max(4, Math.round(doc.sizeKb / 4));
      updateDoc(doc.id, {
        embeddingStatus: "ready",
        indexed: true,
        chunkCount: chunks,
        lastIndexedAt: new Date().toISOString(),
      });
      setReindexingId(null);
    }, 1200);
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
          onClick={openCreate}
        >
          <Upload data-icon="inline-start" />
          Add document
        </Button>
      }
    >
      <ul className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm shadow-zinc-900/[0.03]">
        {knowledgeDocs.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-slate-400">
            No documents yet. Add one to seed the knowledge base.
          </li>
        ) : (
          knowledgeDocs.map((doc) => (
            <li
              key={doc.id}
              className="border-b border-zinc-100 px-4 py-3.5 text-sm last:border-b-0"
            >
              <div className="flex flex-wrap items-start gap-3">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-900/[0.06] text-teal-800">
                  <FileText className="size-4" />
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-slate-900">
                      {doc.name}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        statusBadge(doc.embeddingStatus),
                      )}
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
                      <span className="font-semibold tabular-nums">
                        {doc.chunkCount}
                      </span>
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
                      reindexingId === doc.id ||
                      doc.embeddingStatus === "indexing"
                        ? "Indexing"
                        : "Re-index"
                    }
                    disabled={
                      reindexingId === doc.id ||
                      doc.embeddingStatus === "indexing"
                    }
                    onClick={() => reindex(doc)}
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
                      {reindexingId === doc.id ||
                      doc.embeddingStatus === "indexing"
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
                        deleteDoc(doc.id);
                      }
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-1.5rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add document</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="doc-name">File name</Label>
              <input
                id="doc-name"
                className={fieldClass()}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="returns-policy.pdf"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="doc-type">Type</Label>
                <input
                  id="doc-type"
                  className={fieldClass()}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="doc-size">Size (KB)</Label>
                <input
                  id="doc-size"
                  type="number"
                  min={0}
                  className={fieldClass()}
                  value={form.sizeKb}
                  onChange={(e) => setForm({ ...form, sizeKb: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="doc-collection">Collection</Label>
                <input
                  id="doc-collection"
                  className={fieldClass()}
                  value={form.collection}
                  onChange={(e) =>
                    setForm({ ...form, collection: e.target.value })
                  }
                  placeholder="policies"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="doc-status">Embedding status</Label>
                <select
                  id="doc-status"
                  className={fieldClass()}
                  value={form.embeddingStatus}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      embeddingStatus: e.target.value as EmbeddingStatus,
                    })
                  }
                >
                  <option value="ready">ready</option>
                  <option value="pending">pending</option>
                  <option value="indexing">indexing</option>
                  <option value="failed">failed</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-chunks">Chunk count</Label>
              <input
                id="doc-chunks"
                type="number"
                min={0}
                className={fieldClass()}
                value={form.chunkCount}
                onChange={(e) =>
                  setForm({ ...form, chunkCount: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-tags">Tags (comma-separated)</Label>
              <input
                id="doc-tags"
                className={fieldClass()}
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="returns, refunds"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-teal-800 text-white hover:bg-teal-700"
              >
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PanelShell>
  );
}
