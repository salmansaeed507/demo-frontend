import { STARTER_PROMPTS } from "./constants";
import { useAgentChat } from "../hooks/AgentChatProvider";

export default function StarterPrompts() {
  const { isChatBusy, sendMessage } = useAgentChat();

  return (
    <div className="flex flex-wrap justify-start gap-2">
      {STARTER_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          disabled={isChatBusy}
          onClick={() => void sendMessage(prompt)}
          className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[0.8rem] leading-snug font-medium text-primary transition hover:bg-blue-500/15 disabled:opacity-40"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
