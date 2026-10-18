import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import SupportChatMessageBubble, {
  type SupportChatMessage,
} from "./SupportChatMessageBubble";

const SUGGESTIONS = [
  "Where is my order #48291?",
  "What's your return policy?",
  "Track my refund",
] as const;

const STATIC_REPLY =
  "Thanks for your message — live support chat is coming soon.";

const SEED_MESSAGES: SupportChatMessage[] = [
  {
    role: "agent",
    text: "Ask me about your orders, shipping, returns, or refunds — or anything else and I'll create a ticket if I can't help.",
  },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function SupportChatPanel({ open, onOpenChange }: Props) {
  const [messages, setMessages] =
    useState<SupportChatMessage[]>(SEED_MESSAGES);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  // Static for now: replies are canned, no agent call.
  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setDraft("");
    setMessages((prev) => [
      ...prev,
      { role: "user", text: trimmed },
      { role: "agent", text: STATIC_REPLY },
    ]);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(draft);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border px-4 py-3 text-left">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-white">
              <Bot className="size-4" />
            </span>
            <div>
              <SheetTitle className="text-base">Gadget Grove support</SheetTitle>
              <SheetDescription className="text-xs">
                Live support chat coming soon
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div
          ref={listRef}
          className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
        >
          {messages.map((m, i) => (
            <SupportChatMessageBubble key={`${m.role}-${i}`} message={m} />
          ))}
        </div>

        <div className="space-y-2 border-t border-border px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="cursor-pointer font-normal hover:bg-muted"
                onClick={() => send(s)}
              >
                {s}
              </Badge>
            ))}
          </div>
          <form onSubmit={onSubmit} className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask about orders, returns…"
            />
            <Button type="submit" size="icon" disabled={!draft.trim()}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
