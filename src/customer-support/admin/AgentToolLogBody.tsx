import { Loader2 } from "lucide-react";
import type { AgentTraceStep } from "../store/types";

type Props = {
  steps: AgentTraceStep[];
  thinking: boolean;
  visibleCount: number;
  calling: boolean;
};

export default function AgentToolLogBody({
  steps,
  thinking,
  visibleCount,
  calling,
}: Props) {
  return (
    <div className="space-y-1.5 pl-0.5 text-[13px] leading-relaxed text-slate-500">
      {thinking ? (
        <p className="flex items-center gap-1.5">
          <Loader2 className="size-3.5 animate-spin opacity-70" />
          Thinking…
        </p>
      ) : null}
      {steps.slice(0, visibleCount).map((step, i) => {
        const isCalling = calling && i === visibleCount - 1;
        return (
          <div key={`${step.tool}-${i}`} className="min-w-0">
            <p className="flex items-center gap-1.5">
              {isCalling ? (
                <Loader2 className="size-3.5 shrink-0 animate-spin opacity-70" />
              ) : null}
              <span>
                {isCalling ? "Calling" : "Called"}{" "}
                <span className="text-slate-600">{step.tool}</span>
                {isCalling ? "…" : ""}
              </span>
            </p>
            {step.input ? (
              <p className="pl-5 font-mono text-[11px] text-slate-400">
                {step.input}
              </p>
            ) : null}
            {!isCalling ? (
              <p className="pl-5 font-mono text-[11px] text-slate-400">
                → {step.output}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
