import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  Eraser,
  MessageSquarePlus,
  PanelLeft,
  Send,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { selectActiveThread, useChatStore } from "../store/chatStore";
import { AGENT_STARTER_PROMPTS, sleep } from "./agentChatConstants";
import AgentLiveTurn, { type AgentLiveTurnState } from "./AgentLiveTurn";
import AgentMessageBubble from "./AgentMessageBubble";
import AgentThreadList from "./AgentThreadList";

type Props = {
  onMobileBack?: () => void;
};

export default function AgentChatPanel({ onMobileBack }: Props) {
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
      <div className="flex h-full flex-1 items-center justify-center bg-white text-sm text-slate-500">
        Loading chats…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 bg-white px-4 text-center">
        <p className="max-w-md text-sm text-red-600">
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
    <section className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-white">
      <div className="flex min-h-0 flex-1">
        {threadsOpen ? (
          <div className="absolute inset-0 z-20 flex">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Close threads overlay"
              onClick={() => setThreadsOpen(false)}
            />
            <aside className="relative z-10 flex h-full w-[min(18rem,85vw)] flex-col bg-white shadow-xl">
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
          <div className="flex h-12 shrink-0 items-center gap-1 border-b border-zinc-200 px-2 sm:gap-2 sm:px-4">
            {onMobileBack ? (
              <Button
                type="button"
                size="icon"
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
              size="icon"
              variant="ghost"
              aria-label="Open threads"
              title="Threads"
              onClick={() => setThreadsOpen(true)}
            >
              <PanelLeft className="size-4" />
            </Button>
            <Bot className="hidden size-4 text-teal-700 sm:block" />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
              {activeThread?.title ?? "Agent chat"}
            </span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="New thread"
              disabled={busy}
              onClick={() => void createThread()}
            >
              <MessageSquarePlus className="size-4" />
            </Button>
            {activeThread ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="px-2 sm:px-3"
                disabled={busy}
                onClick={() => void clearThreadMessages(activeThread.id)}
              >
                <Eraser className="size-4" />
                <span className="ml-1.5 hidden sm:inline">Clear</span>
              </Button>
            ) : null}
          </div>

          <div
            ref={listRef}
            className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-3 py-4 sm:px-5 sm:py-5"
          >
            {showEmpty ? (
              <div className="m-auto flex w-full max-w-md flex-col items-center px-2 text-center">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-[#0f766e] text-white shadow-md shadow-teal-900/20">
                    <Store className="size-6" />
                  </span>
                  <div className="text-left">
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-teal-800/70 uppercase">
                      ShopPilot AI
                    </p>
                    <p className="font-heading text-lg font-semibold tracking-tight text-slate-900">
                      Customer Support Agent
                    </p>
                  </div>
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  Hi, how can I help you?
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-[15px]">
                  Probe the live stack — knowledge retrieval with sources,
                  order lookups, and ticket tools.
                </p>
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

          <div className="shrink-0 border-t border-zinc-200 bg-white px-3 py-3 sm:px-5 sm:py-4">
            <div className="mx-auto w-full max-w-2xl">
              <div className="-mx-1 mb-2.5 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {AGENT_STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={busy}
                    onClick={() => void runTurn(prompt)}
                    className="shrink-0 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-left text-[12px] leading-snug text-slate-600 shadow-sm transition hover:border-teal-700/30 hover:bg-teal-50/60 hover:text-teal-950 disabled:opacity-40"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <form
                onSubmit={onSubmit}
                className="flex items-end gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-1.5 shadow-sm sm:p-2"
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
                  className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-60 sm:max-h-40 sm:min-h-[44px] sm:px-3 sm:py-2.5"
                />
                <button
                  type="submit"
                  aria-label="Send"
                  className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:opacity-40 sm:size-10"
                  disabled={!draft.trim() || busy}
                >
                  <Send className="size-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
