import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Narrow the content column (forms, chat). Default is full max-w-6xl. */
  contentClassName?: string;
};

/** Full-bleed gradient hero + white content band used across the storefront. */
export default function PageShell({
  title,
  description,
  children,
  contentClassName,
}: Props) {
  return (
    <div className="-mx-4 -mt-6 space-y-0 sm:-mt-8">
      <section className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-gradient-to-b from-indigo-100 via-violet-50 to-zinc-100 px-4 pt-10 pb-10 sm:pt-12 sm:pb-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-heading max-w-2xl text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </section>

      <section className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-white py-8">
        <div className={contentClassName ?? "mx-auto max-w-6xl px-4"}>
          {children}
        </div>
      </section>
    </div>
  );
}
