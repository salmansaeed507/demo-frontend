import { Bot, MessageCircle } from "lucide-react";

type Props = {
  onOpen: () => void;
};

export default function StorefrontFloatingChatButton({ onOpen }: Props) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open AI support chat"
      className="group fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full border border-primary bg-primary py-3 pr-3.5 pl-3 text-primary-foreground shadow-[0_10px_30px_rgba(24,24,27,0.18)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 sm:right-5 sm:bottom-5 sm:py-3.5 sm:pr-4 sm:pl-3.5"
    >
      <span className="relative flex size-9 items-center justify-center rounded-full bg-primary-foreground/15">
        <Bot className="relative size-5" />
      </span>
      <span className="hidden pr-1 text-left sm:block">
        <span className="block text-sm font-semibold leading-tight">
          ShopPilot AI
        </span>
        <span className="block text-[11px] font-medium text-primary-foreground/80 leading-tight">
          Ask support
        </span>
      </span>
      <MessageCircle className="size-4 opacity-80 sm:hidden" />
    </button>
  );
}
