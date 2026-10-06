import { MessageSquarePlus, Pencil, Trash2, X } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatThread } from "../store/types";
import { fieldClass } from "./styles";

type Props = {
  threads: ChatThread[];
  activeThreadId: string;
  busy: boolean;
  renamingId: string | null;
  renameValue: string;
  onRenameValueChange: (value: string) => void;
  onStartRename: (id: string, title: string) => void;
  onCommitRename: () => void;
  onSelectThread: (id: string) => void;
  onCreateThread: () => void;
  onDeleteThread: (id: string) => void;
  onClose: () => void;
};

export default function AgentThreadList({
  threads,
  activeThreadId,
  busy,
  renamingId,
  renameValue,
  onRenameValueChange,
  onStartRename,
  onCommitRename,
  onSelectThread,
  onCreateThread,
  onDeleteThread,
  onClose,
}: Props) {
  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-4">
        <h2 className="font-heading text-[1.35rem] leading-tight text-foreground">
          Threads
        </h2>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-label="New thread"
            disabled={busy}
            onClick={onCreateThread}
          >
            <MessageSquarePlus className="size-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-label="Close threads"
            onClick={onClose}
          >
            <X className="size-4" />
            <span className="hidden sm:inline">Close</span>
          </Button>
        </div>
      </div>
      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
        {threads.map((t) => (
          <li key={t.id}>
            {renamingId === t.id ? (
              <form
                className="p-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  onCommitRename();
                }}
              >
                <input
                  autoFocus
                  className={fieldClass()}
                  value={renameValue}
                  onChange={(e) => onRenameValueChange(e.target.value)}
                  onBlur={onCommitRename}
                />
              </form>
            ) : (
              <div
                className={cn(
                  "group flex items-start gap-1 rounded-[14px] px-3 py-2.5 text-left text-sm transition",
                  activeThreadId === t.id
                    ? "bg-foreground/[0.09] text-foreground"
                    : "text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground",
                )}
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => onSelectThread(t.id)}
                >
                  <span className="line-clamp-2 font-semibold leading-snug text-foreground">
                    {t.title}
                  </span>
                  <span className="mt-0.5 block text-[0.78rem] text-muted-foreground">
                    {t.messages.length} msgs
                  </span>
                </button>
                <div className="flex shrink-0 flex-col opacity-100 md:opacity-0 md:transition md:group-hover:opacity-100">
                  <button
                    type="button"
                    className="rounded-full p-1 text-muted-foreground hover:text-foreground"
                    aria-label="Rename thread"
                    onClick={() => onStartRename(t.id, t.title)}
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <ConfirmDialog
                    title="Delete thread"
                    description="Delete this thread? This cannot be undone."
                    confirmLabel="Delete"
                    onConfirm={() => onDeleteThread(t.id)}
                    trigger={
                      <button
                        type="button"
                        className="rounded-full p-1 text-muted-foreground hover:text-destructive"
                        aria-label="Delete thread"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    }
                  />
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
