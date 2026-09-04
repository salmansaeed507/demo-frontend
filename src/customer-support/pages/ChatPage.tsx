import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Send, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import PageShell from "../PageShell";

type Role = "customer" | "agent";

type ChatMessage = {
  id: string;
  role: Role;
  text: string;
};

const seedMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "agent",
    text: "Hi! I'm ShopPilot AI. I can help with orders, shipping, returns, and store policies.",
  },
  {
    id: "m2",
    role: "customer",
    text: "Where is my order #48291?",
  },
  {
    id: "m3",
    role: "agent",
    text: "I looked up order #48291. It's out for delivery with carrier MockShip — ETA today by 8:00 PM. Tracking: MS-48291-TX.",
  },
];

function mockAgentReply(userText: string): string {
  const lower = userText.toLowerCase();
  if (lower.includes("return") || lower.includes("refund")) {
    return "Per our return policy, unused items can be returned within 30 days with the original receipt. I can start a return request, or create a support ticket if you need an exception.";
  }
  if (lower.includes("order") || /#?\d{4,}/.test(userText)) {
    return "I found a matching order in the demo catalog. Status: Processing / in transit. For live lookups this will call the mock order API — here it's a static reply.";
  }
  if (lower.includes("ticket") || lower.includes("human")) {
    return "I don't have enough information to resolve that confidently. I can create a support ticket with this conversation summary — say the word and I'll file it for the admin dashboard.";
  }
  return "I've noted that. Based on our knowledge base, feel free to ask about shipping, returns, or an order number. If I can't help, I can open a support ticket.";
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [draft, setDraft] = useState("");
  const [customerName, setCustomerName] = useState("Guest");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("cs-demo-user");
      if (raw) {
        const user = JSON.parse(raw) as { name?: string };
        if (user.name) setCustomerName(user.name);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function onSend(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "customer",
      text,
    };
    setDraft("");
    setMessages((prev) => [...prev, userMsg]);

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "agent",
          text: mockAgentReply(text),
        },
      ]);
    }, 450);
  }

  return (
    <PageShell
      title="Support chat"
      description={
        <>
          Signed in as {customerName}. Conversation is local-only.{" "}
          <Link to="/shoppilot-ai/login" className="underline">
            Switch account
          </Link>
        </>
      }
      contentClassName="mx-auto max-w-2xl px-4"
    >
      <Card className="flex h-[min(70vh,640px)] flex-col">
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Conversation</CardTitle>
            <Badge variant="secondary">AI agent · mock</Badge>
          </div>
          <CardDescription>
            Ask about orders, returns, or policies.
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 p-0">
          <ScrollArea className="h-full px-4 py-4">
            <div className="space-y-4">
              {messages.map((msg) => {
                const isAgent = msg.role === "agent";
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2",
                      isAgent ? "justify-start" : "justify-end",
                    )}
                  >
                    {isAgent && (
                      <Avatar className="size-8">
                        <AvatarFallback>
                          <Bot className="size-3.5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-md px-3 py-2 text-sm",
                        isAgent
                          ? "bg-muted text-foreground"
                          : "bg-primary text-primary-foreground",
                      )}
                    >
                      {msg.text}
                    </div>
                    {!isAgent && (
                      <Avatar className="size-8">
                        <AvatarFallback>
                          <User className="size-3.5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t">
          <form onSubmit={onSend} className="flex w-full gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask about an order, return, or policy…"
              className="flex-1 resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend(e);
                }
              }}
            />
            <Button type="submit" size="icon" aria-label="Send message">
              <Send />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </PageShell>
  );
}
