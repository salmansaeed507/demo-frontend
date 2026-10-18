import { ChatPanel } from "./chat";
import { AgentChatProvider } from "./hooks/AgentChatProvider";

type Props = {
  onMobileBack?: () => void;
  onClose?: () => void;
};

export default function AgentChatPanel({ onMobileBack, onClose }: Props) {
  return (
    <AgentChatProvider>
      <ChatPanel onMobileBack={onMobileBack} onClose={onClose} />
    </AgentChatProvider>
  );
}
