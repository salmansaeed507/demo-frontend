import type { ReactNode } from "react";

type Stat = { label: string; value: string | number };

type Props = {
  title: string;
  description: string;
  stats?: Stat[];
  action?: ReactNode;
  children: ReactNode;
};

/** Shared chrome for manage tabs — Steep admin ahead + stats. */
export default function PanelShell({
  title,
  description,
  stats,
  action,
  children,
}: Props) {
  return (
    <div className="space-y-[18px]">
      <div className="flex flex-wrap items-end justify-between gap-3 pt-4 pb-[6px] sm:pt-5">
        <div className="min-w-0">
          <h1 className="font-heading text-[2rem] tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>

      {stats && stats.length > 0 ? (
        <div className="mb-[2px] grid grid-cols-2 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-card px-5 py-[18px]"
            >
              <p className="font-heading text-[2.1rem] leading-none tracking-tight text-foreground">
                {s.value}
              </p>
              <p className="mt-1 text-[0.9rem] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      ) : null}

      {children}
    </div>
  );
}
