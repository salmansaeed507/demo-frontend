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
import { useChatStore } from "./store/chatStore";
import SupportChatMessageBubble, {
  type SupportChatMessage,
} from "./SupportChatMessageBubble";

const SUGGESTIONS = [
  "Where is my order #48291?",
  "What's your return policy?",
  "Track my refund",
] as const;

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
  const beginAgentTurn = useChatStore((s) => s.beginAgentTurn);
  const completeAgentTurn = useChatStore((s) => s.completeAgentTurn);
  const load = useChatStore((s) => s.load);
  const [messages, setMessages] =
    useState<SupportChatMessage[]>(SEED_MESSAGES);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setDraft("");
    setBusy(true);
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    try {
      const plan = await beginAgentTurn(trimmed);
      if (!plan) return;
      completeAgentTurn(plan);
      const tool = plan.trace.find(
        (s) => s.tool !== "plan" && s.tool !== "compose_reply",
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text: plan.reply,
          tool: tool
            ? `${tool.tool}${tool.input ? `(${tool.input})` : ""}`
            : undefined,
          source: plan.citations?.[0]?.filename,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text: "Sorry — I couldn't reach the support agent just now. Try again in a moment.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(draft);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-zinc-200 px-4 py-3 text-left">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-500 text-white">
              <Bot className="size-4" />
            </span>
            <div>
              <SheetTitle className="text-base">ShopPilot support</SheetTitle>
              <SheetDescription className="text-xs">
                Powered by the customer-support agent API
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

        <div className="space-y-2 border-t border-zinc-200 px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="cursor-pointer font-normal hover:bg-zinc-50"
                onClick={() => void send(s)}
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
              disabled={busy}
            />
            <Button type="submit" size="icon" disabled={busy || !draft.trim()}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
