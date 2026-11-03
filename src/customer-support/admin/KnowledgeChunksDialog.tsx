import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import MarkdownContent from "@/components/MarkdownContent";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type { ApiKnowledgeChunk } from "@/api/customerSupport";
import { listKnowledgeChunks } from "@/api/customerSupport";
import type { KnowledgeDoc } from "../store/types";

type ViewMode = "md" | "text";

/** Rough token estimate (chars/4) for display only — not the exact tokenizer count. */
function estimateTokenCount(text: string): number {
  return text.trim() ? Math.max(1, Math.ceil(text.length / 4)) : 0;
}

type Props = {
  doc: KnowledgeDoc | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function KnowledgeChunksDialog({
  doc,
  open,
  onOpenChange,
}: Props) {
  const [chunks, setChunks] = useState<ApiKnowledgeChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("md");

  useEffect(() => {
    if (!open || !doc) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setChunks([]);
    setSelectedIndex(0);
    void listKnowledgeChunks(doc.id)
      .then((rows) => {
        if (cancelled) return;
        setChunks(rows);
        setSelectedIndex(0);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load chunks");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, doc]);

  const selected = chunks[selectedIndex] ?? null;

  const meta = useMemo(() => {
    if (!selected) return "";
    const parts = [
      `${estimateTokenCount(selected.content)} tokens`,
      selected.section ? `Section: ${selected.section}` : null,
      selected.page != null ? `Page ${selected.page}` : null,
    ].filter(Boolean);
    return parts.join(" · ");
  }, [selected]);

  function go(delta: number) {
    setSelectedIndex((i) => {
      const next = i + delta;
      if (next < 0 || next >= chunks.length) return i;
      return next;
    });
  }

  useEffect(() => {
    if (!open || chunks.length === 0) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('[role="radiogroup"]')) return;
      event.preventDefault();
      go(event.key === "ArrowLeft" ? -1 : 1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, chunks.length]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[min(80vh,720px)] w-[calc(100%-1.5rem)] max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:rounded-[22px]"
        showCloseButton
      >
        <DialogHeader className="shrink-0 border-b border-border px-6 py-4 pr-12">
          <DialogTitle className="text-[1.35rem]">
            {doc?.name ?? "Chunks"}
          </DialogTitle>
          <DialogDescription>
            {loading
              ? "Loading chunks…"
              : error
                ? error
                : `${chunks.length} chunk${chunks.length === 1 ? "" : "s"}`}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading…
          </div>
        ) : error ? (
          <div className="flex flex-1 items-center justify-center px-6 text-destructive">
            {error}
          </div>
        ) : chunks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-6 text-muted-foreground">
            No chunks indexed yet. Refresh after indexing finishes.
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
            <aside className="flex max-h-[40%] w-full shrink-0 flex-col border-b border-border sm:max-h-none sm:w-[240px] sm:border-r sm:border-b-0">
              <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {chunks.map((chunk, index) => {
                  const active = index === selectedIndex;
                  return (
                    <button
                      key={chunk.id}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className={cn(
                        "mb-1 w-full rounded-xl px-3 py-2.5 text-left transition-colors",
                        active
                          ? "bg-foreground text-background"
                          : "hover:bg-foreground/[0.06]",
                      )}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="text-[0.92rem] font-semibold tabular-nums">
                          Chunk {chunk.chunkIndex + 1}
                        </div>
                        <div
                          className={cn(
                            "shrink-0 text-[0.72rem] tabular-nums",
                            active ? "opacity-75" : "text-muted-foreground",
                          )}
                        >
                          {estimateTokenCount(chunk.content)} tok
                        </div>
                      </div>
                      <div
                        className={cn(
                          "mt-0.5 truncate text-[0.78rem]",
                          active ? "opacity-75" : "text-muted-foreground",
                        )}
                      >
                        {chunk.section || "Document"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-2.5">
                <div className="min-w-0">
                  <div className="text-[0.92rem] font-semibold tabular-nums">
                    {selectedIndex + 1} / {chunks.length}
                  </div>
                  {meta ? (
                    <div className="truncate text-[0.8rem] text-muted-foreground">
                      {meta}
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <ToggleGroup
                    type="single"
                    size="sm"
                    variant="outline"
                    value={viewMode}
                    onValueChange={(value) => {
                      if (value === "md" || value === "text") setViewMode(value);
                    }}
                    aria-label="Chunk preview mode"
                  >
                    <ToggleGroupItem value="md" aria-label="Markdown preview">
                      MD
                    </ToggleGroupItem>
                    <ToggleGroupItem value="text" aria-label="Plain text">
                      Text
                    </ToggleGroupItem>
                  </ToggleGroup>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={selectedIndex <= 0}
                    onClick={() => go(-1)}
                    aria-label="Previous chunk"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={selectedIndex >= chunks.length - 1}
                    onClick={() => go(1)}
                    aria-label="Next chunk"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                {viewMode === "md" ? (
                  <MarkdownContent className="text-[0.95rem] text-foreground">
                    {selected?.content ?? ""}
                  </MarkdownContent>
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-[0.95rem] leading-relaxed text-foreground">
                    {selected?.content ?? ""}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
