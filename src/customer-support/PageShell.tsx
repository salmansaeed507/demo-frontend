import type { ReactNode } from "react";
import SiteFooter from "@/components/SiteFooter";

type Props = {
  children?: ReactNode;
  /** Narrow the content column (forms, chat). Default is full max-w-6xl. */
  contentClassName?: string;
  /** Storefront marketing hero. Off for admin. */
  showHero?: boolean;
};

/** Steep-style hero + surface content band used across the storefront. */
export default function PageShell({
  children,
  contentClassName,
  showHero = true,
}: Props) {
  return (
    <div className="-mx-4 -mt-6 flex min-h-full flex-col space-y-0 sm:-mt-8">
      {showHero ? (
        <section className="relative left-1/2 w-screen max-w-[100vw] shrink-0 -translate-x-1/2 px-4 pt-6 pb-2 sm:pt-8">
          <div className="mx-auto max-w-[1180px]">
            <div className="overflow-hidden rounded-[32px] bg-[color-mix(in_srgb,var(--tint)_34%,var(--card))] px-[clamp(22px,4.5vw,56px)] py-[clamp(22px,4.5vw,48px)]">
              <h1 className="font-heading max-w-[12ch] text-[clamp(2rem,4.5vw,3.4rem)] tracking-[-0.03em] text-foreground">
                Shop the shelf, let ShopPilot handle support
              </h1>
              <p className="mt-[18px] max-w-[44ch] text-[1.1rem] text-foreground/80">
                An AI agent that answers questions, tracks orders, and opens
                tickets — wired to your knowledge base and order API.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 py-8">
        <div className={contentClassName ?? "mx-auto max-w-[1180px] px-4"}>
          {children}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
