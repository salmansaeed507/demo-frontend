import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  useAgent,
  useCopilotKit,
  UseAgentUpdate,
} from "@copilotkit/react-core/v2/headless";
import * as api from "../../../api/customerSupport";
import { mapThread } from "../../../api/mappers";
import { mapAgentMessages } from "../chat/mapMessages";
import type { ChatMessage, ChatThread } from "../../store/types";

const AGENT_ID = "default";
const UNTITLED = "Untitled";

/* -------------------------------------------------------------------------- */
/* Threads: list + CRUD against customer-support-agent REST                    */
/* -------------------------------------------------------------------------- */

function useChatThreads() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchThreads() {
    const list = (await api.listChatThreads()).map(mapThread);
    setThreads(list);
    setActiveThreadId((prev) =>
      list.some((t) => t.id === prev) ? prev : list[0]?.id ?? "",
    );
  }

  async function reloadThreads() {
    setIsLoading(true);
    setError(null);
    try {
      await fetchThreads();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chats");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void reloadThreads();
  }, []);

  /** Local draft only — no API call until the first message is sent. */
  function createThread() {
    setActiveThreadId("");
  }

  async function createThreadFromFirstMessage(text: string, id: string) {
    const now = new Date().toISOString();
    setActiveThreadId(id);
    setThreads((prev) =>
      prev.some((t) => t.id === id)
        ? prev
        : [
            {
              id,
              title: UNTITLED,
              createdAt: now,
              updatedAt: now,
              messages: [],
            },
            ...prev,
          ],
    );

    const thread = mapThread(await api.createChatThread({ text, id }));
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...thread, messages: t.messages } : t)),
    );
    return thread;
  }

  async function renameThread(id: string, title: string) {
    const updated = mapThread(
      await api.updateChatThread(id, { title: title.trim() || UNTITLED }),
    );
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...updated, messages: t.messages } : t)),
    );
  }

  async function deleteThread(id: string) {
    await api.deleteChatThread(id);
    await fetchThreads();
  }

  const activeThread = threads.find((t) => t.id === activeThreadId);

  return {
    threads,
    activeThreadId,
    activeThreadTitle: activeThreadId
      ? activeThread?.title?.trim() || UNTITLED
      : UNTITLED,
    isThreadsLoading: isLoading,
    threadsError: error,
    reloadThreads,
    selectThread: setActiveThreadId,
    createThread,
    createThreadFromFirstMessage,
    renameThread,
    deleteThread,
  };
}

/* -------------------------------------------------------------------------- */
/* Messages: CopilotKit agent pinned to the active thread                      */
/* -------------------------------------------------------------------------- */

/** Keep the user bubble + pending assistant visible before the agent has them. */
function withOptimisticSend(
  mapped: ChatMessage[],
  pending: { id: string; text: string } | null,
  showPendingAssistant: boolean,
): ChatMessage[] {
  if (!pending) return mapped;
  if (mapped.some((m) => m.id === pending.id)) return mapped;

  const out = mapped.filter((m) => m.id !== "pending-assistant");
  out.push({
    id: pending.id,
    role: "user",
    text: pending.text,
    createdAt: new Date().toISOString(),
  });
  if (showPendingAssistant) {
    out.push({
      id: "pending-assistant",
      role: "assistant",
      text: "",
      streaming: true,
      createdAt: new Date().toISOString(),
    });
  }
  return out;
}

function useChatMessages(
  activeThreadId: string,
  createThreadFromFirstMessage: (
    text: string,
    id: string,
  ) => Promise<ChatThread>,
) {
  const { agent, isReady: isAgentReady } = useAgent({
    agentId: AGENT_ID,
    updates: [
      UseAgentUpdate.OnMessagesChanged,
      UseAgentUpdate.OnRunStatusChanged,
      UseAgentUpdate.OnStateChanged,
    ],
  });
  const { copilotkit } = useCopilotKit();

  // Refs so the thread-switch effect below only reacts to the thread id,
  // never to agent/threads changing while a run is streaming.
  const agentRef = useRef(agent);
  agentRef.current = agent;

  const shownThreadId = useRef("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [pendingUser, setPendingUser] = useState<{
    id: string;
    text: string;
  } | null>(null);

  // Draft (no thread id): clear the agent; do not load history yet.
  // Skip while a first message is in flight so we don't wipe optimistic UI work.
  useEffect(() => {
    if (!isAgentReady || activeThreadId || pendingUser) return;
    const current = agentRef.current;
    if (shownThreadId.current) void current.detachActiveRun?.();
    shownThreadId.current = "";
    current.setMessages([]);
    current.setState({});
  }, [activeThreadId, isAgentReady, pendingUser]);

  // On thread switch: pin the agent and load checkpointer history from the API.
  useEffect(() => {
    if (!isAgentReady || !activeThreadId) return;
    if (shownThreadId.current === activeThreadId) return;
    // First-message create pins the id inline in sendMessage.
    if (pendingUser) return;

    const current = agentRef.current;
    if (shownThreadId.current) void current.detachActiveRun?.();
    const threadId = activeThreadId;
    shownThreadId.current = threadId;

    current.threadId = threadId;
    current.setMessages([]);
    current.setState({});

    let cancelled = false;
    setIsConnecting(true);
    api
      .listChatThreadMessages(threadId)
      .then((msgs) => {
        if (cancelled || shownThreadId.current !== threadId) return;
        current.setMessages(
          msgs.map((m) => ({ id: m.id, role: m.role, content: m.text })),
        );
      })
      .catch((err) => {
        if (!cancelled && shownThreadId.current === threadId) {
          console.error("Failed to load thread messages", err);
        }
      })
      .finally(() => {
        if (!cancelled && shownThreadId.current === threadId) {
          setIsConnecting(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeThreadId, isAgentReady, pendingUser]);

  const isAgentRunning = agent.isRunning;
  // Not memoized: the agent can mutate `agent.messages` in place while
  // streaming, so identity-based memo would hide tool/text updates.
  const messages = withOptimisticSend(
    mapAgentMessages(agent.messages ?? [], isAgentRunning),
    pendingUser,
    Boolean(pendingUser) && !isAgentRunning,
  );

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content || isAgentRunning || pendingUser) return;

    const userMsgId = crypto.randomUUID();
    setPendingUser({ id: userMsgId, text: content });

    try {
      let threadId = activeThreadId;
      if (!threadId) {
        // Client-owned id so runAgent can start before the REST create finishes.
        threadId = crypto.randomUUID();
        const current = agentRef.current;
        current.threadId = threadId;
        shownThreadId.current = threadId;
        current.setMessages([]);
        current.setState({});
        void createThreadFromFirstMessage(content, threadId).catch((err) => {
          console.error("Failed to create thread", err);
        });
      }

      agent.threadId = threadId;
      agent.addMessage({ id: userMsgId, role: "user", content });
      await copilotkit.runAgent({ agent });
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setPendingUser(null);
    }
  }

  function stopAgent() {
    copilotkit.stopAgent({ agent });
  }

  function resetMessages(threadId: string) {
    if (threadId === activeThreadId) {
      agent.setMessages([]);
      agent.setState({});
    }
  }

  return {
    messages,
    isAgentReady,
    isAgentRunning,
    isConnecting,
    isChatBusy:
      isAgentRunning ||
      isConnecting ||
      Boolean(pendingUser) ||
      !isAgentReady,
    isConversationEmpty:
      messages.length === 0 &&
      !isAgentRunning &&
      !isConnecting &&
      !pendingUser,
    sendMessage,
    stopAgent,
    resetMessages,
  };
}

/* -------------------------------------------------------------------------- */
/* Provider                                                                    */
/* -------------------------------------------------------------------------- */

function useAgentChatValue() {
  const t = useChatThreads();
  const m = useChatMessages(t.activeThreadId, t.createThreadFromFirstMessage);

  return {
    ...t,
    ...m,
    deleteThread: async (id: string) => {
      await t.deleteThread(id);
      m.resetMessages(id);
    },
  };
}

const AgentChatContext = createContext<ReturnType<
  typeof useAgentChatValue
> | null>(null);

/** Wrap the admin chat UI in this; read everything via `useAgentChat()`. */
export function AgentChatProvider({ children }: { children: ReactNode }) {
  return (
    <AgentChatContext.Provider value={useAgentChatValue()}>
      {children}
    </AgentChatContext.Provider>
  );
}

export function useAgentChat() {
  const ctx = useContext(AgentChatContext);
  if (!ctx) throw new Error("useAgentChat must be used inside AgentChatProvider");
  return ctx;
}
