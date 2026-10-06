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
        "flex gap-2.5 sm:gap-3",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser ? (
        <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground sm:size-9">
          <Store className="size-3.5 sm:size-4" />
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
            "rounded-[18px] px-3.5 py-2.5 text-[0.94rem] leading-relaxed sm:px-4 sm:py-3",
            isUser
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-foreground",
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
