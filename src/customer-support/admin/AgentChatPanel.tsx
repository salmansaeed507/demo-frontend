import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  ChevronDown,
  Eraser,
  Loader2,
  MessageSquarePlus,
  PanelLeft,
  Pencil,
  Send,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useShopPilot,
  type AgentTraceStep,
  type RetrievalCitation,
} from "../store/ShopPilotStore";
import { fieldClass } from "./styles";

type Props = {
  onMobileBack?: () => void;
};

type LiveTurn = {
  steps: AgentTraceStep[];
  thinking: boolean;
  /** Number of tool rows visible */
  visibleCount: number;
  /** Last visible tool is still spinning (no output yet) */
  calling: boolean;
};

/** Guided paths that hit the strongest tool demos. */
const STARTER_PROMPTS = [
  "What's your return window?",
  "Where is order #48291?",
  "Summarize ticket TCK-1042",
  "Is the Aurora headphones still in stock?",
] as const;

function sleep(ms: number) {
  return new Promise((r) => window.setTimeout(r, ms));
}

function CitationList({ citations }: { citations: RetrievalCitation[] }) {
  return (
    <details className="group mt-2.5">
      <summary className="flex w-fit cursor-pointer list-none items-center gap-1 py-0.5 text-[12px] text-slate-500 transition hover:text-slate-700 marker:content-none [&::-webkit-details-marker]:hidden">
        <ChevronDown className="size-3.5 shrink-0 -rotate-90 transition group-open:rotate-0" />
        <span>
          Sources
          <span className="text-slate-400">
            {" "}
            · {citations.length} citation{citations.length === 1 ? "" : "s"}
          </span>
        </span>
      </summary>
      <ul className="mt-2 space-y-2 border-l border-zinc-200 pl-3">
        {citations.map((c) => (
          <li key={`${c.filename}-${c.rank}`} className="min-w-0 text-[13px]">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-medium text-slate-700">{c.filename}</span>
              <span className="tabular-nums text-[11px] text-slate-400">
                #{c.rank} · {c.score.toFixed(2)}
              </span>
            </div>
            <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">
              “{c.excerpt}”
            </p>
          </li>
        ))}
      </ul>
    </details>
  );
}

function ToolLogBody({
  steps,
  thinking,
  visibleCount,
  calling,
}: {
  steps: AgentTraceStep[];
  thinking: boolean;
  visibleCount: number;
  calling: boolean;
}) {
  return (
    <div className="space-y-1.5 pl-0.5 text-[13px] leading-relaxed text-slate-500">
      {thinking ? (
        <p className="flex items-center gap-1.5">
          <Loader2 className="size-3.5 animate-spin opacity-70" />
          Thinking…
        </p>
      ) : null}
      {steps.slice(0, visibleCount).map((step, i) => {
        const isCalling = calling && i === visibleCount - 1;
        return (
          <div key={`${step.tool}-${i}`} className="min-w-0">
            <p className="flex items-center gap-1.5">
              {isCalling ? (
                <Loader2 className="size-3.5 shrink-0 animate-spin opacity-70" />
              ) : null}
              <span>
                {isCalling ? "Calling" : "Called"}{" "}
                <span className="text-slate-600">{step.tool}</span>
                {isCalling ? "…" : ""}
              </span>
            </p>
            {step.input ? (
              <p className="pl-5 font-mono text-[11px] text-slate-400">
                {step.input}
              </p>
            ) : null}
            {!isCalling ? (
              <p className="pl-5 font-mono text-[11px] text-slate-400">
                → {step.output}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function CollapsedToolLog({ trace }: { trace: AgentTraceStep[] }) {
  return (
    <details className="group mb-1.5">
      <summary className="flex w-fit cursor-pointer list-none items-center gap-1 py-0.5 text-[13px] text-slate-500 transition hover:text-slate-700 marker:content-none [&::-webkit-details-marker]:hidden">
        <ChevronDown className="size-3.5 shrink-0 -rotate-90 transition group-open:rotate-0" />
        <span>
          Thought for a moment
          <span className="text-slate-400">
            {" "}
            · {trace.length} tool{trace.length === 1 ? "" : "s"}
          </span>
        </span>
      </summary>
      <div className="mt-1.5 border-l border-zinc-200 pl-3">
        <ToolLogBody
          steps={trace}
          thinking={false}
          visibleCount={trace.length}
          calling={false}
        />
      </div>
    </details>
  );
}

function LiveAgentTurn({ live }: { live: LiveTurn }) {
  return (
    <div className="flex gap-2 sm:gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#0f766e] sm:size-8">
        <Store className="size-3.5 text-white sm:size-4" />
      </div>
      <div className="min-w-0 max-w-[min(100%,28rem)] flex-1 pt-1 sm:max-w-[85%]">
        <p className="mb-1.5 flex items-center gap-1 text-[13px] text-slate-500">
          <ChevronDown className="size-3.5 shrink-0" />
          {live.thinking
            ? "Thinking…"
            : live.calling
              ? "Running tools…"
              : "Finishing…"}
        </p>
        <div className="border-l border-zinc-200 pl-3">
          <ToolLogBody
            steps={live.steps}
            thinking={live.thinking}
            visibleCount={live.visibleCount}
            calling={live.calling}
          />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={cn(
        "flex gap-2 sm:gap-3",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser ? (
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#0f766e] sm:size-8">
          <Store className="size-3.5 text-white sm:size-4" />
        </div>
      ) : null}
      <div
        className={cn(
          "min-w-0",
          isUser
            ? "max-w-[90%] sm:max-w-[85%]"
            : "max-w-[min(100%,28rem)] sm:max-w-[85%]",
        )}
      >
        {!isUser && msg.trace && msg.trace.length > 0 ? (
          <CollapsedToolLog trace={msg.trace} />
        ) : null}
        <div
          className={cn(
            "rounded-2xl px-3 py-2.5 text-sm leading-relaxed sm:px-4 sm:py-3",
            isUser ? "bg-indigo-600 text-white" : "bg-zinc-100 text-slate-800",
          )}
        >
          {msg.text}
          {!isUser && msg.citations && msg.citations.length > 0 ? (
            <CitationList citations={msg.citations} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AgentChatPanel({ onMobileBack }: Props) {
  const {
    threads,
    activeThreadId,
    activeThread,
    setActiveThreadId,
    createThread,
    renameThread,
    deleteThread,
    beginAgentTurn,
    completeAgentTurn,
    clearThreadMessages,
  } = useShopPilot();
  const [draft, setDraft] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [threadsOpen, setThreadsOpen] = useState(false);
  const [live, setLive] = useState<LiveTurn | null>(null);
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeThread?.messages, live]);

  useEffect(() => {
    // Cancel in-flight animation if user switches thread
    runIdRef.current += 1;
    setLive(null);
    setBusy(false);
  }, [activeThreadId]);

  function openThreadsPanel() {
    setThreadsOpen(true);
  }

  async function runTurn(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const plan = beginAgentTurn(trimmed);
    if (!plan) return;

    setDraft("");
    setBusy(true);
    const runId = ++runIdRef.current;

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
      renameThread(renamingId, renameValue);
      setRenamingId(null);
    }
  }

  function selectThread(id: string) {
    setActiveThreadId(id);
    setThreadsOpen(false);
  }

  const showEmpty =
    (activeThread?.messages.length ?? 0) === 0 && !live;

  const threadList = (
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
            onClick={() => {
              createThread();
              setThreadsOpen(false);
            }}
          >
            <MessageSquarePlus className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Close threads"
            onClick={() => setThreadsOpen(false)}
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
                  commitRename();
                }}
              >
                <input
                  autoFocus
                  className={fieldClass()}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={commitRename}
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
                  onClick={() => selectThread(t.id)}
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
                    onClick={() => startRename(t.id, t.title)}
                  >
                    <Pencil className="size-3" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-0.5 text-slate-400 hover:text-rose-600"
                    aria-label="Delete thread"
                    onClick={() => {
                      if (confirm("Delete this thread?")) deleteThread(t.id);
                    }}
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );

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
              {threadList}
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
              onClick={openThreadsPanel}
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
              onClick={() => createThread()}
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
                onClick={() => clearThreadMessages(activeThread.id)}
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
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
                {live ? <LiveAgentTurn live={live} /> : null}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-zinc-200 bg-white px-3 py-3 sm:px-5 sm:py-4">
            <div className="mx-auto w-full max-w-2xl">
              <div className="-mx-1 mb-2.5 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {STARTER_PROMPTS.map((prompt) => (
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
