import { Store } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "../store/types";
import AgentCitationList from "./AgentCitationList";
import AgentCollapsedToolLog from "./AgentCollapsedToolLog";

type Props = {
  message: ChatMessage;
};

export default function AgentMessageBubble({ message }: Props) {
  const isUser = message.role === "user";
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
        {!isUser && message.trace && message.trace.length > 0 ? (
          <AgentCollapsedToolLog trace={message.trace} />
        ) : null}
        <div
          className={cn(
            "rounded-2xl px-3 py-2.5 text-sm leading-relaxed sm:px-4 sm:py-3",
            isUser ? "bg-indigo-600 text-white" : "bg-zinc-100 text-slate-800",
          )}
        >
          {message.text}
          {!isUser && message.citations && message.citations.length > 0 ? (
            <AgentCitationList citations={message.citations} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
