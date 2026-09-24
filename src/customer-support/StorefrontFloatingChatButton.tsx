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
      className="group fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-indigo-600 to-violet-500 py-3 pr-3.5 pl-3 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 sm:right-5 sm:bottom-5 sm:py-3.5 sm:pr-4 sm:pl-3.5"
    >
      <span className="relative flex size-9 items-center justify-center rounded-full bg-white/15">
        <span className="absolute inset-0 animate-ping rounded-full bg-white/20 [animation-duration:2.5s]" />
        <Bot className="relative size-5" />
      </span>
      <span className="hidden pr-1 text-left sm:block">
        <span className="block text-sm font-semibold leading-tight">
          ShopPilot AI
        </span>
        <span className="block text-[11px] font-medium text-white/80 leading-tight">
          Ask support
        </span>
      </span>
      <MessageCircle className="size-4 opacity-80 sm:hidden" />
    </button>
  );
}
