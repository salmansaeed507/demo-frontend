import { ChevronDown, Store } from "lucide-react";
import type { AgentTraceStep } from "../store/types";
import AgentToolLogBody from "./AgentToolLogBody";

export type AgentLiveTurnState = {
  steps: AgentTraceStep[];
  thinking: boolean;
  /** Number of tool rows visible */
  visibleCount: number;
  /** Last visible tool is still spinning (no output yet) */
  calling: boolean;
};

type Props = {
  live: AgentLiveTurnState;
};

export default function AgentLiveTurn({ live }: Props) {
  return (
    <div className="flex gap-2 sm:gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#0f766e] sm:size-8">
        <Store className="size-3.5 text-white sm:size-4" />
      </div>
      <div className="min-w-0 max-w-[min(100%,28rem)] flex-1 pt-1 sm:max-w-[85%]">
        <p className="mb-1.5 flex items-center gap-1 text-[13px] text-slate-500">
          <ChevronDown className="size-3.5 shrink-0" />
          {live.thinking
            ? "Thinking…"
            : live.calling
              ? "Running tools…"
              : "Finishing…"}
        </p>
        <div className="border-l border-zinc-200 pl-3">
          <AgentToolLogBody
            steps={live.steps}
            thinking={live.thinking}
            visibleCount={live.visibleCount}
            calling={live.calling}
          />
        </div>
      </div>
    </div>
  );
}
