import type { RetrievalCitation } from "../store/types";
import { ChevronDown } from "lucide-react";

type Props = {
  citations: RetrievalCitation[];
};

export default function AgentCitationList({ citations }: Props) {
  return (
    <details className="group mt-2.5">
      <summary className="flex w-fit cursor-pointer list-none items-center gap-1 py-0.5 text-[12px] text-slate-500 transition hover:text-slate-700 marker:content-none [&::-webkit-details-marker]:hidden">
        <ChevronDown className="size-3.5 shrink-0 -rotate-90 transition group-open:rotate-0" />
        <span>
          Sources
          <span className="text-slate-400">
            {" "}
            · {citations.length} citation{citations.length === 1 ? "" : "s"}
          </span>
        </span>
      </summary>
      <ul className="mt-2 space-y-2 border-l border-zinc-200 pl-3">
        {citations.map((c) => (
          <li key={`${c.filename}-${c.rank}`} className="min-w-0 text-[13px]">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-medium text-slate-700">{c.filename}</span>
              <span className="tabular-nums text-[11px] text-slate-400">
                #{c.rank} · {c.score.toFixed(2)}
              </span>
            </div>
            <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">
              “{c.excerpt}”
            </p>
          </li>
        ))}
      </ul>
    </details>
  );
}
