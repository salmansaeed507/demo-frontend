import { FileText, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type SupportChatMessage = {
  role: "agent" | "user";
  text: string;
  tool?: string;
  source?: string;
};

type Props = {
  message: SupportChatMessage;
};

export default function SupportChatMessageBubble({ message }: Props) {
  return (
    <div
      className={cn(
        "flex gap-2",
        message.role === "user" ? "justify-end" : "justify-start",
      )}
    >
      {message.role === "agent" ? (
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-3.5" />
        </span>
      ) : null}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
          message.role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        {message.tool ? (
          <p className="mb-1 font-mono text-[10px] text-muted-foreground">
            {message.tool}
          </p>
        ) : null}
        <p className="leading-relaxed">{message.text}</p>
        {message.source ? (
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <FileText className="size-3" />
            {message.source}
          </p>
        ) : null}
      </div>
      {message.role === "user" ? (
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <User className="size-3.5" />
        </span>
      ) : null}
    </div>
  );
}
