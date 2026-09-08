import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, FileText, Send, Sparkles, User } from "lucide-react";
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
import { cn } from "@/lib/utils";

const suggestions = [
  "Where is my order #48291?",
  "What's your return policy?",
  "Track my refund",
];

type Msg = { role: "agent" | "user"; text: string; tool?: string; source?: string };

const seed: Msg[] = [
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
  const [messages, setMessages] = useState<Msg[]>(seed);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setDraft("");
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    window.setTimeout(() => {
      const lower = trimmed.toLowerCase();
      if (lower.includes("return")) {
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            tool: "kb.search('return policy')",
            text: "You can return unused items within 30 days with the original receipt. Refunds post in 5–7 business days after we receive the item.",
            source: "return-policy.pdf",
          },
        ]);
      } else if (lower.includes("order") || lower.includes("48291")) {
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            tool: "orders.get('48291')",
            text: "Order #48291 is out for delivery — ETA today by 8:00 PM (MockShip MS-48291-TX).",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            text: "I don't have enough information to answer confidently. I can create a support ticket if you'd like a human to follow up.",
          },
        ]);
      }
    }, 400);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(draft);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-zinc-200 p-0 sm:max-w-md"
      >
        <SheetHeader className="space-y-0 border-b border-zinc-200 bg-gradient-to-r from-indigo-600 to-violet-500 p-4 text-left text-white">
          <div className="flex items-center gap-3 pr-8">
            <div className="flex size-10 items-center justify-center rounded-md bg-white/15 ring-1 ring-white/25">
              <Bot className="size-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <SheetTitle className="text-base text-white">
                  ShopPilot AI
                </SheetTitle>
                <Badge className="border-0 bg-white/20 text-white hover:bg-white/20">
                  <span className="mr-1.5 size-1.5 rounded-full bg-emerald-300" />
                  Online
                </Badge>
              </div>
              <SheetDescription className="text-white/80">
                Support · knowledge base + order API
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col bg-zinc-50">
          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((msg, i) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={`${msg.role}-${i}`}
                  className={cn(
                    "flex gap-2",
                    isUser ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
                      isUser
                        ? "bg-slate-200 text-slate-700"
                        : "bg-gradient-to-br from-indigo-600 to-violet-500 text-white",
                    )}
                  >
                    {isUser ? (
                      <User className="size-3.5" />
                    ) : (
                      <Bot className="size-3.5" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[80%] space-y-2 rounded-lg px-3.5 py-2.5 text-sm shadow-sm",
                      isUser
                        ? "bg-indigo-600 text-white"
                        : "border border-zinc-200 bg-white text-slate-900",
                    )}
                  >
                    {msg.tool ? (
                      <div className="flex items-start gap-1.5 rounded-md bg-indigo-50 px-2 py-1.5 font-mono text-[11px] text-indigo-700">
                        <Sparkles className="mt-0.5 size-3 shrink-0" />
                        <span className="break-all">{msg.tool}</span>
                      </div>
                    ) : null}
                    <p className="leading-relaxed">{msg.text}</p>
                    {msg.source ? (
                      <p
                        className={cn(
                          "flex items-center gap-1.5 text-xs",
                          isUser ? "text-white/80" : "text-muted-foreground",
                        )}
                      >
                        <FileText className="size-3 shrink-0" />
                        Source: {msg.source}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-3 border-t border-zinc-200 bg-white p-4">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-left text-xs font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {s}
                </button>
              ))}
            </div>
            <form onSubmit={onSubmit} className="flex items-center gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about orders, returns..."
                className="flex-1 border-zinc-200 bg-zinc-50 focus-visible:bg-white"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-indigo-600 hover:bg-indigo-600/90"
                aria-label="Send"
              >
                <Send />
              </Button>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
