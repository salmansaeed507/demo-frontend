import { Store } from "lucide-react";
import MarkdownContent from "@/components/MarkdownContent";
import type { ChatMessage } from "../../store/types";
import CitationList from "./CitationList";

type Props = {
  message: ChatMessage;
};

function TypingDots() {
  return (
    <span
      className="inline-flex items-center gap-1 py-2"
      role="status"
      aria-label="Thinking"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}

function DebugBubble({ message }: Props) {
  const label =
    message.debugKind === "tool_call"
      ? `tool call${message.toolName ? `: ${message.toolName}` : ""}`
      : message.debugKind === "tool_result"
        ? `tool result${message.toolName ? `: ${message.toolName}` : ""}${
            message.toolCallId ? ` (${message.toolCallId})` : ""
          }`
        : message.debugKind || message.role;

  return (
    <div className="rounded border border-dashed border-border bg-muted/40 px-3 py-2 font-mono text-[0.75rem] leading-relaxed text-muted-foreground">
      <div className="mb-1 font-semibold uppercase tracking-wide text-foreground/70">
        {label}
      </div>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words">
        {message.text || "(empty)"}
      </pre>
    </div>
  );
}

export default function MessageBubble({ message }: Props) {
  if (
    message.role === "tool" ||
    message.role === "system" ||
    message.role === "debug"
  ) {
    return <DebugBubble message={message} />;
  }

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[90%] rounded-[18px] bg-primary px-3.5 py-2.5 text-[0.94rem] leading-relaxed text-primary-foreground sm:max-w-[85%] sm:px-4 sm:py-3">
          <MarkdownContent variant="inverse">{message.text}</MarkdownContent>
        </div>
      </div>
    );
  }

  const showDots = message.streaming && !message.text;

  return (
    <div className="flex gap-2.5 sm:gap-3">
      <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground sm:size-9">
        <Store className="size-3.5 sm:size-4" />
      </div>
      <div className="min-w-0 max-w-[min(100%,28rem)] pt-1 sm:max-w-[85%]">
        {message.text ? (
          <div className="text-[0.94rem] leading-relaxed text-foreground">
            <MarkdownContent>{message.text}</MarkdownContent>
            {message.citations && message.citations.length > 0 ? (
              <CitationList citations={message.citations} />
            ) : null}
          </div>
        ) : null}
        {showDots ? <TypingDots /> : null}
      </div>
    </div>
  );
}
