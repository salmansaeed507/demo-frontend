import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Eraser,
  MessageSquarePlus,
  PanelLeft,
  Send,
  Store,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { selectActiveThread, useChatStore } from "../store/chatStore";
import { AGENT_STARTER_PROMPTS, sleep } from "./agentChatConstants";
import AgentLiveTurn, { type AgentLiveTurnState } from "./AgentLiveTurn";
import AgentMessageBubble from "./AgentMessageBubble";
import AgentThreadList from "./AgentThreadList";

type Props = {
  onMobileBack?: () => void;
  onClose?: () => void;
};

export default function AgentChatPanel({ onMobileBack, onClose }: Props) {
  const threads = useChatStore((s) => s.threads);
  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const activeThread = useChatStore(selectActiveThread);
  const status = useChatStore((s) => s.status);
  const error = useChatStore((s) => s.error);
  const load = useChatStore((s) => s.load);
  const setActiveThreadId = useChatStore((s) => s.setActiveThreadId);
  const createThread = useChatStore((s) => s.createThread);
  const renameThread = useChatStore((s) => s.renameThread);
  const deleteThread = useChatStore((s) => s.deleteThread);
  const beginAgentTurn = useChatStore((s) => s.beginAgentTurn);
  const completeAgentTurn = useChatStore((s) => s.completeAgentTurn);
  const clearThreadMessages = useChatStore((s) => s.clearThreadMessages);
  const [draft, setDraft] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [threadsOpen, setThreadsOpen] = useState(false);
  const [live, setLive] = useState<AgentLiveTurnState | null>(null);
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeThread?.messages, live]);

  useEffect(() => {
    runIdRef.current += 1;
    setLive(null);
    setBusy(false);
  }, [activeThreadId]);

  async function runTurn(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setDraft("");
    setBusy(true);
    const runId = ++runIdRef.current;

    let plan: Awaited<ReturnType<typeof beginAgentTurn>>;
    try {
      plan = await beginAgentTurn(trimmed);
    } catch {
      if (runId === runIdRef.current) setBusy(false);
      return;
    }
    if (!plan || runId !== runIdRef.current) return;

    setLive({
      steps: plan.trace,
      thinking: true,
      visibleCount: 0,
      calling: false,
    });
    await sleep(700);
    if (runId !== runIdRef.current) return;

    for (let i = 1; i <= plan.trace.length; i++) {
      setLive({
        steps: plan.trace,
        thinking: false,
        visibleCount: i,
        calling: true,
      });
      await sleep(500);
      if (runId !== runIdRef.current) return;
      setLive({
        steps: plan.trace,
        thinking: false,
        visibleCount: i,
        calling: false,
      });
      await sleep(320);
      if (runId !== runIdRef.current) return;
    }

    await sleep(250);
    if (runId !== runIdRef.current) return;

    completeAgentTurn(plan);
    setLive(null);
    setBusy(false);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void runTurn(draft);
  }

  function startRename(id: string, title: string) {
    setRenamingId(id);
    setRenameValue(title);
  }

  function commitRename() {
    if (renamingId) {
      void renameThread(renamingId, renameValue);
      setRenamingId(null);
    }
  }

  function selectThread(id: string) {
    setActiveThreadId(id);
    setThreadsOpen(false);
  }

  if (status === "idle" || status === "loading") {
    return (
      <div className="flex h-full flex-1 items-center justify-center bg-card text-sm text-muted-foreground">
        Loading chats…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 bg-card px-4 text-center">
        <p className="max-w-md text-sm text-destructive">
          {error ?? "Failed to load chats"}
        </p>
        <Button
          type="button"
          size="sm"
          onClick={() => void load({ force: true })}
        >
          Retry
        </Button>
      </div>
    );
  }

  const showEmpty = (activeThread?.messages.length ?? 0) === 0 && !live;

  return (
    <section className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-card">
      <div className="flex min-h-0 flex-1">
        {threadsOpen ? (
          <div className="absolute inset-0 z-20 flex">
            <button
              type="button"
              className="absolute inset-0 bg-[rgba(10,18,13,0.55)]"
              aria-label="Close threads overlay"
              onClick={() => setThreadsOpen(false)}
            />
            <aside className="relative z-10 flex h-full w-[min(18rem,85vw)] flex-col border-r border-border bg-card">
              <AgentThreadList
                threads={threads}
                activeThreadId={activeThreadId}
                busy={busy}
                renamingId={renamingId}
                renameValue={renameValue}
                onRenameValueChange={setRenameValue}
                onStartRename={startRename}
                onCommitRename={commitRename}
                onSelectThread={selectThread}
                onCreateThread={() => {
                  void createThread();
                  setThreadsOpen(false);
                }}
                onDeleteThread={(id) => void deleteThread(id)}
                onClose={() => setThreadsOpen(false)}
              />
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-[18px] py-4 sm:px-[22px]">
            <div className="flex min-w-0 items-center gap-2">
              {onMobileBack ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="md:hidden"
                  aria-label="Back to manage"
                  onClick={onMobileBack}
                >
                  <ArrowLeft className="size-4" />
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                aria-label="Open threads"
                title="Threads"
                onClick={() => setThreadsOpen(true)}
              >
                <PanelLeft className="size-4" />
                <span className="hidden sm:inline">Threads</span>
              </Button>
              <h2 className="font-heading min-w-0 truncate text-[1.35rem] leading-tight tracking-tight text-foreground sm:text-[1.5rem]">
                {activeThread?.title ?? "Agent chat"}
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => void createThread()}
              >
                <MessageSquarePlus className="size-4" />
                <span className="hidden sm:inline">New</span>
              </Button>
              {activeThread ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => void clearThreadMessages(activeThread.id)}
                >
                  <Eraser className="size-4" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
              ) : null}
              {onClose ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="hidden md:inline-flex"
                  aria-label="Hide chat"
                  onClick={onClose}
                >
                  <X className="size-4" />
                  <span className="hidden lg:inline">Hide</span>
                </Button>
              ) : null}
            </div>
          </header>

          <div
            ref={listRef}
            className="flex flex-1 flex-col overflow-y-auto overscroll-contain bg-background px-[18px] py-5 sm:px-[22px]"
          >
            {showEmpty ? (
              <div className="m-auto w-full max-w-md">
                <div className="overflow-hidden rounded-[22px] border border-border bg-card px-6 py-7">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Store className="size-5" />
                    </span>
                    <div>
                      <p className="text-[0.78rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                        ShopPilot AI
                      </p>
                      <p className="font-heading text-[1.35rem] leading-tight text-foreground">
                        Customer Support Agent
                      </p>
                    </div>
                  </div>
                  <h3 className="font-heading text-[1.7rem] leading-tight tracking-tight text-foreground">
                    Hi, how can I help you?
                  </h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
                    Probe the live stack — knowledge retrieval with sources,
                    order lookups, and ticket tools.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 sm:gap-5">
                {(activeThread?.messages ?? []).map((msg) => (
                  <AgentMessageBubble key={msg.id} message={msg} />
                ))}
                {live ? <AgentLiveTurn live={live} /> : null}
              </div>
            )}
          </div>

          <footer className="shrink-0 border-t border-border bg-card px-[18px] pt-4 pb-5 sm:px-[22px]">
            <div className="mx-auto w-full max-w-2xl">
              <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {AGENT_STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={busy}
                    onClick={() => void runTurn(prompt)}
                    className="shrink-0 rounded-full bg-foreground/[0.08] px-3.5 py-1.5 text-left text-[0.78rem] leading-snug font-medium text-foreground transition hover:bg-foreground/[0.12] disabled:opacity-40"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <form
                onSubmit={onSubmit}
                className="flex items-end gap-2 rounded-[14px] border border-border bg-card p-2"
              >
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void runTurn(draft);
                    }
                  }}
                  rows={1}
                  disabled={busy}
                  placeholder="Ask about orders, products, returns…"
                  className="max-h-32 min-h-[42px] flex-1 resize-none bg-transparent px-2.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:outline-none disabled:opacity-60 sm:max-h-40"
                />
                <Button
                  type="submit"
                  size="icon"
                  aria-label="Send"
                  className="mb-0.5 size-10 shrink-0"
                  disabled={!draft.trim() || busy}
                >
                  <Send className="size-4" />
                </Button>
              </form>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}
