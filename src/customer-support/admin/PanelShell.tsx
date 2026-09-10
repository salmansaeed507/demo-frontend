import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Stat = { label: string; value: string | number };

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  stats?: Stat[];
  action?: ReactNode;
  children: ReactNode;
};

/** Shared chrome for manage tabs — header, stats, content. */
export default function PanelShell({
  icon: Icon,
  title,
  description,
  stats,
  action,
  children,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-900/[0.08] text-teal-800">
            <Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              {title}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          </div>
        </div>
        {action}
      </div>

      {stats && stats.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-zinc-200/80 bg-white px-3 py-2.5"
            >
              <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
                {s.label}
              </p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight text-slate-900">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {children}
    </div>
  );
}
