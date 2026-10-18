import { useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { cn } from "@/lib/utils";
import { useAgentChat } from "../hooks/AgentChatProvider";

type Props = {
  onClose: () => void;
};

export default function ThreadList({ onClose }: Props) {
  const {
    threads,
    activeThreadId,
    selectThread,
    deleteThread,
    renameThread,
  } = useAgentChat();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  function startRename(id: string, title: string) {
    setRenamingId(id);
    setRenameValue(title);
  }

  function commitRename() {
    if (!renamingId) return;
    void renameThread(renamingId, renameValue.trim() || "Untitled");
    setRenamingId(null);
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-4">
        <h2 className="font-heading text-[1.35rem] leading-tight text-foreground">
          Threads
        </h2>
        <button
          type="button"
          className="grid size-8 cursor-pointer place-items-center text-muted-foreground transition hover:text-foreground"
          aria-label="Close threads"
          onClick={onClose}
        >
          <X className="size-4" />
        </button>
      </div>
      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
        {threads.map((t) => {
          const title = t.title?.trim() || "Untitled";
          return (
            <li key={t.id}>
              <div
                className={cn(
                  "group flex items-start gap-1 rounded-[14px] px-3 py-2.5 text-left text-sm transition",
                  activeThreadId === t.id || renamingId === t.id
                    ? "bg-foreground/[0.09] text-foreground"
                    : "text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground",
                )}
              >
                {renamingId === t.id ? (
                  <form
                    className="min-w-0 flex-1"
                    onSubmit={(e) => {
                      e.preventDefault();
                      commitRename();
                    }}
                  >
                    <input
                      autoFocus
                      className="w-full bg-transparent text-[0.95rem] font-semibold leading-snug text-foreground outline-none"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={commitRename}
                    />
                  </form>
                ) : (
                  <button
                    type="button"
                    className="min-w-0 flex-1 whitespace-normal text-left"
                    onClick={() => {
                      selectThread(t.id);
                      onClose();
                    }}
                  >
                    <span className="block text-[0.95rem] font-semibold leading-snug break-words text-foreground">
                      {title}
                    </span>
                  </button>
                )}
                <div className="flex shrink-0 flex-col opacity-100 md:opacity-0 md:transition md:group-hover:opacity-100">
                  <button
                    type="button"
                    className="rounded-full p-1 text-muted-foreground hover:text-foreground"
                    aria-label="Rename thread"
                    onClick={() => startRename(t.id, title)}
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <ConfirmDialog
                    title="Delete thread"
                    description="Delete this thread? This cannot be undone."
                    confirmLabel="Delete"
                    onConfirm={() => void deleteThread(t.id)}
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
            </li>
          );
        })}
      </ul>
    </>
  );
}
