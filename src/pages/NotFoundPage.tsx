import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageShell from "../customer-support/PageShell";

type ShopPilotProps = {
  /** When false, content only — AdminLayout already provides PageShell. */
  withShell?: boolean;
};

function ShopPilotNotFoundContent() {
  return (
    <div className="flex min-h-[50vh] flex-col justify-center py-8 sm:py-12">
      <p className="text-sm font-medium tracking-wide text-indigo-600 uppercase">
        404
      </p>
      <h1 className="font-heading mt-2 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-xl text-base text-slate-600 sm:text-lg">
        That URL doesn’t match anything in this ShopPilot demo. Head back to the
        storefront or the Demo Hub.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link to="/shoppilot-ai">Back to ShopPilot</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}

/** 404 inside the ShopPilot demo (uses demo chrome via layout + PageShell). */
export function ShopPilotNotFoundPage({ withShell = true }: ShopPilotProps) {
  if (!withShell) {
    return <ShopPilotNotFoundContent />;
  }

  return (
    <PageShell>
      <ShopPilotNotFoundContent />
    </PageShell>
  );
}

/** 404 outside any demo — no header, no footer. */
export function GenericNotFoundPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        That URL doesn’t match anything in this app.
      </p>
      <p className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link to="/" className="text-indigo-600 underline">
          Go home
        </Link>
        <Link to="/shoppilot-ai" className="text-indigo-600 underline">
          ShopPilot AI
        </Link>
      </p>
    </main>
  );
}
