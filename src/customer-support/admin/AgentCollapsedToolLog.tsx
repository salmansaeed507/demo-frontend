import { ChevronDown } from "lucide-react";
import type { AgentTraceStep } from "../store/types";
import AgentToolLogBody from "./AgentToolLogBody";

type Props = {
  trace: AgentTraceStep[];
};

export default function AgentCollapsedToolLog({ trace }: Props) {
  return (
    <details className="group mb-1.5">
      <summary className="flex w-fit cursor-pointer list-none items-center gap-1 py-0.5 text-[13px] text-slate-500 transition hover:text-slate-700 marker:content-none [&::-webkit-details-marker]:hidden">
        <ChevronDown className="size-3.5 shrink-0 -rotate-90 transition group-open:rotate-0" />
        <span>
          Thought for a moment
          <span className="text-slate-400">
            {" "}
            · {trace.length} tool{trace.length === 1 ? "" : "s"}
          </span>
        </span>
      </summary>
      <div className="mt-1.5 border-l border-zinc-200 pl-3">
        <AgentToolLogBody
          steps={trace}
          thinking={false}
          visibleCount={trace.length}
          calling={false}
        />
      </div>
    </details>
  );
}
