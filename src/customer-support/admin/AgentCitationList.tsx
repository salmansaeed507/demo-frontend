import type { RetrievalCitation } from "../store/types";
import { ChevronDown } from "lucide-react";

type Props = {
  citations: RetrievalCitation[];
};

export default function AgentCitationList({ citations }: Props) {
  return (
    <details className="group mt-2.5">
      <summary className="flex w-fit cursor-pointer list-none items-center gap-1 py-0.5 text-[12px] text-muted-foreground transition hover:text-foreground/80 marker:content-none [&::-webkit-details-marker]:hidden">
        <ChevronDown className="size-3.5 shrink-0 -rotate-90 transition group-open:rotate-0" />
        <span>
          Sources
          <span className="text-muted-foreground">
            {" "}
            · {citations.length} citation{citations.length === 1 ? "" : "s"}
          </span>
        </span>
      </summary>
      <ul className="mt-2 space-y-2 rounded-[14px] border border-border bg-background/70 px-3.5 py-3">
        {citations.map((c) => (
          <li key={`${c.filename}-${c.rank}`} className="min-w-0 text-[13px]">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-semibold text-foreground">{c.filename}</span>
              <span className="tabular-nums text-[11px] text-muted-foreground">
                #{c.rank} · {c.score.toFixed(2)}
              </span>
            </div>
            <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
              “{c.excerpt}”
            </p>
          </li>
        ))}
      </ul>
    </details>
  );
}
