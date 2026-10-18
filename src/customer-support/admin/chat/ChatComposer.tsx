import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAgentChat } from "../hooks/AgentChatProvider";

export default function ChatComposer() {
  const { isChatBusy, sendMessage } = useAgentChat();
  const [draft, setDraft] = useState("");

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isChatBusy) return;
    setDraft("");
    await sendMessage(trimmed);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(draft);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(draft);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full items-end gap-2 rounded-[14px] border border-border bg-card p-2"
    >
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        disabled={isChatBusy}
        placeholder="Ask about orders, products, returns…"
        className="max-h-32 min-h-[42px] flex-1 resize-none bg-transparent px-2.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:outline-none disabled:opacity-60 sm:max-h-40"
      />
      <Button
        type="submit"
        size="icon"
        aria-label="Send"
        className="mb-0.5 size-10 shrink-0"
        disabled={!draft.trim() || isChatBusy}
      >
        <Send className="size-4" />
      </Button>
    </form>
  );
}
