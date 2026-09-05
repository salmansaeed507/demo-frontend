import type { ReactNode } from "react";
import SiteFooter from "@/components/SiteFooter";

type Props = {
  children: ReactNode;
  /** Narrow the content column (forms, chat). Default is full max-w-6xl. */
  contentClassName?: string;
};

/** Gradient hero + white content band used across the storefront. */
export default function PageShell({ children, contentClassName }: Props) {
  return (
    <div className="-mx-4 -mt-6 flex min-h-full flex-col space-y-0 sm:-mt-8">
      <section className="relative left-1/2 w-screen max-w-[100vw] shrink-0 -translate-x-1/2 bg-gradient-to-b from-indigo-100 via-violet-50 to-zinc-100 px-4 pt-10 pb-10 sm:pt-12 sm:pb-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-heading max-w-2xl text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Shop the store, let{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">
              ShopPilot AI
            </span>{" "}
            handle support
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
            An AI agent that answers questions, tracks orders, and opens tickets
            — wired to your knowledge base and order API.
          </p>
        </div>
      </section>

      <section className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-white py-8">
        <div className={contentClassName ?? "mx-auto max-w-6xl px-4"}>
          {children}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
