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

export default function MessageBubble({ message }: Props) {
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
