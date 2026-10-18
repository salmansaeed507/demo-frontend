import { useEffect, useRef } from "react";
import { LoaderCircle } from "lucide-react";
import MessageBubble from "./MessageBubble";
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
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>
    </div>
  );
}
