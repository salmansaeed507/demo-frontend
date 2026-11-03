import { useEffect, useRef } from "react";
import { LoaderCircle } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { SHOW_ALL_AGENT_MESSAGES } from "./devFlags";
import { useAgentChat } from "../hooks/AgentChatProvider";

export default function MessageList() {
  const { messages, isConnecting } = useAgentChat();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  if (isConnecting && messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <LoaderCircle
          className="size-6 animate-spin text-muted-foreground"
          aria-label="Loading messages"
        />
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className="flex flex-1 flex-col overflow-y-auto overscroll-contain bg-background px-[18px] py-5 sm:px-[22px]"
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 sm:gap-5">
        {SHOW_ALL_AGENT_MESSAGES ? (
          <div className="rounded border border-dashed border-amber-600/40 bg-amber-500/10 px-3 py-2 text-[0.78rem] text-amber-800 dark:text-amber-200">
            Dev: showing all agent messages (tools / RAG / system). Set{" "}
            <code>VITE_SHOW_ALL_AGENT_MESSAGES=false</code> to hide.
          </div>
        ) : null}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>
    </div>
  );
}
