import { Bot } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ChatComposer from "./admin/chat/ChatComposer";
import ChatStatus from "./admin/chat/ChatStatus";
import MessageList from "./admin/chat/MessageList";
import StarterPrompts from "./admin/chat/StarterPrompts";
import {
  AgentChatProvider,
  useAgentChat,
} from "./admin/hooks/AgentChatProvider";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function StorefrontChatBody() {
  const {
    isThreadsLoading,
    threadsError,
    reloadThreads,
    isConversationEmpty,
    isConnecting,
    messages,
  } = useAgentChat();

  if (isThreadsLoading) {
    return (
      <ChatStatus
        status="loading"
        error={null}
        onRetry={() => reloadThreads()}
      />
    );
  }

  if (threadsError) {
    return (
      <ChatStatus
        status="error"
        error={threadsError}
        onRetry={() => reloadThreads()}
      />
    );
  }

  const showConnectingEmpty = isConnecting && messages.length === 0;

  return (
    <>
      {showConnectingEmpty || !isConversationEmpty ? (
        <MessageList />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 bg-background px-4 py-5 text-center">
          <h3 className="font-heading text-xl leading-tight tracking-tight text-foreground">
            Hi, how can I help you?
          </h3>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Ask me about your orders, shipping, returns, or refunds — or
            anything else and I&apos;ll create a ticket if I can&apos;t help.
          </p>
        </div>
      )}
      <div className="shrink-0 space-y-2 border-t border-border bg-background px-4 py-3">
        {isConversationEmpty ? <StarterPrompts /> : null}
        <ChatComposer />
      </div>
    </>
  );
}

export default function SupportChatPanel({ open, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border px-4 py-3 text-left">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Bot className="size-4" />
            </span>
            <div>
              <SheetTitle className="text-base">
                Gadget Grove support
              </SheetTitle>
              <SheetDescription className="text-xs">
                Ask about orders, shipping, or returns
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <AgentChatProvider agentId="storefront">
          <div className="flex min-h-0 flex-1 flex-col">
            <StorefrontChatBody />
          </div>
        </AgentChatProvider>
      </SheetContent>
    </Sheet>
  );
}
