import { FormEvent, useState } from "react";
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
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b p-4 text-left">
          <div className="flex items-center gap-2 pr-8">
            <div className="flex size-9 items-center justify-center rounded-md bg-muted">
              <Bot className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <SheetTitle>ShopAssist — AI Support</SheetTitle>
                <Badge variant="secondary">Online</Badge>
              </div>
              <SheetDescription>
                Powered by knowledge base + order API
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col bg-background">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div
                key={`${msg.role}-${i}`}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-md px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {msg.tool ? (
                    <code className="mb-2 block rounded-md bg-background/80 px-2 py-1 font-mono text-[11px] text-muted-foreground">
                      {msg.tool}
                    </code>
                  ) : null}
                  <p>
                    {msg.text}
                    {msg.source ? (
                      <span className="text-muted-foreground">
                        {" "}
                        (Source: {msg.source})
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t p-4">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => send(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
            <form onSubmit={onSubmit} className="flex items-center gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about orders, returns..."
                className="flex-1"
              />
              <Button type="submit" size="icon" aria-label="Send">
                <Send />
              </Button>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
