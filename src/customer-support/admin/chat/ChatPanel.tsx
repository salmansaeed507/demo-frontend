import { useState } from "react";
import ChatComposer from "./ChatComposer";
import ChatEmptyState from "./ChatEmptyState";
import ChatHeader from "./ChatHeader";
import ChatStatus from "./ChatStatus";
import MessageList from "./MessageList";
import StarterPrompts from "./StarterPrompts";
import ThreadOverlay from "./ThreadOverlay";
import { cn } from "@/lib/utils";
import { useAgentChat } from "../hooks/AgentChatProvider";

type Props = {
  onMobileBack?: () => void;
  onClose?: () => void;
};

function ComposeStack({ newChat }: { newChat?: boolean }) {
  const { messages } = useAgentChat();

  return (
    <div
      className={cn(
        "mx-auto flex flex-col gap-3",
        newChat ? "w-[80%]" : "w-full max-w-2xl",
      )}
    >
      {messages.length === 0 ? <StarterPrompts /> : null}
      <ChatComposer />
    </div>
  );
}

export default function ChatPanel({ onMobileBack, onClose }: Props) {
  const {
    isThreadsLoading,
    threadsError,
    reloadThreads,
    isConversationEmpty,
    isConnecting,
    messages,
  } = useAgentChat();
  const [threadsOpen, setThreadsOpen] = useState(false);

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
    <section className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-card">
      <div className="flex min-h-0 flex-1">
        {threadsOpen ? (
          <ThreadOverlay onClose={() => setThreadsOpen(false)} />
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col">
          <ChatHeader
            onMobileBack={onMobileBack}
            onClose={onClose}
            onOpenThreads={() => setThreadsOpen(true)}
            onThreadCreated={() => setThreadsOpen(false)}
          />
          {showConnectingEmpty ? (
            <MessageList />
          ) : isConversationEmpty ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 bg-background px-[18px] py-5 sm:px-[22px]">
              <ChatEmptyState />
              <ComposeStack newChat />
            </div>
          ) : (
            <>
              <MessageList />
              <div className="shrink-0 bg-background px-[18px] pt-2 pb-5 sm:px-[22px]">
                <ComposeStack />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
