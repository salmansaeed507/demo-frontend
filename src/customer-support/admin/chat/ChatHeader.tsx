import { useEffect, useRef, useState } from "react";
import { ArrowLeft, PanelLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAgentChat } from "../hooks/AgentChatProvider";

type Props = {
  onMobileBack?: () => void;
  onClose?: () => void;
  onOpenThreads: () => void;
  onThreadCreated?: () => void;
};

const TYPE_MS = 36;
const UNTITLED = "Untitled";

export default function ChatHeader({
  onMobileBack,
  onClose,
  onOpenThreads,
  onThreadCreated,
}: Props) {
  const {
    activeThreadId,
    activeThreadTitle,
    isChatBusy,
    createThread,
  } = useAgentChat();

  const [displayTitle, setDisplayTitle] = useState(activeThreadTitle);
  const threadIdRef = useRef(activeThreadId);
  const titleRef = useRef(activeThreadTitle);

  useEffect(() => {
    const prevId = threadIdRef.current;
    const prevTitle = titleRef.current;
    threadIdRef.current = activeThreadId;
    titleRef.current = activeThreadTitle;

    // Switching between existing threads: snap immediately.
    if (prevId && activeThreadId && prevId !== activeThreadId) {
      setDisplayTitle(activeThreadTitle);
      return;
    }

    const shouldType =
      activeThreadTitle !== UNTITLED &&
      activeThreadTitle !== prevTitle &&
      (prevTitle === UNTITLED || !prevId);

    if (shouldType) {
      let i = 0;
      setDisplayTitle("");
      const id = window.setInterval(() => {
        i += 1;
        setDisplayTitle(activeThreadTitle.slice(0, i));
        if (i >= activeThreadTitle.length) window.clearInterval(id);
      }, TYPE_MS);
      return () => window.clearInterval(id);
    }

    setDisplayTitle(activeThreadTitle);
  }, [activeThreadId, activeThreadTitle]);

  const isTyping =
    displayTitle !== activeThreadTitle && activeThreadTitle !== UNTITLED;

  return (
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
          onClick={onOpenThreads}
        >
          <PanelLeft className="size-4" />
        </Button>
        <h2 className="font-heading min-w-0 truncate text-[1.15rem] leading-tight tracking-tight text-foreground sm:text-[1.25rem]">
          {displayTitle}
          {isTyping ? (
            <span className="ml-0.5 inline-block w-[0.55ch] animate-pulse bg-foreground/70 align-baseline">
              &nbsp;
            </span>
          ) : null}
        </h2>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={isChatBusy}
          onClick={() => {
            createThread();
            onThreadCreated?.();
          }}
        >
          New
        </Button>
        {onClose ? (
          <button
            type="button"
            className="hidden size-8 cursor-pointer place-items-center text-muted-foreground transition hover:text-foreground md:grid"
            aria-label="Hide chat"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
    </header>
  );
}
