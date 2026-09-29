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
      <div className="flex items-center justify-between gap-1 border-b border-zinc-200 px-2 py-2">
        <span className="px-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Threads
        </span>
        <div className="flex items-center">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="New thread"
            disabled={busy}
            onClick={onCreateThread}
          >
            <MessageSquarePlus className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Close threads"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
      <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-1.5">
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
                  "group flex items-start gap-1 rounded-lg px-2 py-2 text-left text-sm transition",
                  activeThreadId === t.id
                    ? "bg-indigo-50 text-indigo-900"
                    : "hover:bg-zinc-50",
                )}
              >
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => onSelectThread(t.id)}
                >
                  <span className="line-clamp-2 font-medium leading-snug">
                    {t.title}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-muted-foreground">
                    {t.messages.length} msgs
                  </span>
                </button>
                <div className="flex shrink-0 flex-col opacity-100 md:opacity-0 md:transition md:group-hover:opacity-100">
                  <button
                    type="button"
                    className="rounded p-0.5 text-slate-400 hover:text-slate-700"
                    aria-label="Rename thread"
                    onClick={() => onStartRename(t.id, t.title)}
                  >
                    <Pencil className="size-3" />
                  </button>
                  <ConfirmDialog
                    title="Delete thread"
                    description="Delete this thread? This cannot be undone."
                    confirmLabel="Delete"
                    onConfirm={() => onDeleteThread(t.id)}
                    trigger={
                      <button
                        type="button"
                        className="rounded p-0.5 text-slate-400 hover:text-rose-600"
                        aria-label="Delete thread"
                      >
                        <Trash2 className="size-3" />
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
