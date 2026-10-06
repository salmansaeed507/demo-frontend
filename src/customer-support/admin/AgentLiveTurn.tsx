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
    <div className="flex gap-2.5 sm:gap-3">
      <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground sm:size-9">
        <Store className="size-3.5 sm:size-4" />
      </div>
      <div className="min-w-0 max-w-[min(100%,28rem)] flex-1 pt-1 sm:max-w-[85%]">
        <p className="mb-2 flex items-center gap-1 text-[0.84rem] text-muted-foreground">
          <ChevronDown className="size-3.5 shrink-0" />
          {live.thinking
            ? "Thinking…"
            : live.calling
              ? "Running tools…"
              : "Finishing…"}
        </p>
        <div className="rounded-[14px] border border-border bg-card px-3.5 py-3">
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
