import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageShell from "../customer-support/PageShell";

type GadgetGroveProps = {
  /** When false, content only — AdminLayout already provides PageShell. */
  withShell?: boolean;
};

function GadgetGroveNotFoundContent() {
  return (
    <div className="flex min-h-[50vh] flex-col justify-center py-8 sm:py-12">
      <p className="text-sm font-medium tracking-wide text-primary uppercase">
        404
      </p>
      <h1 className="font-heading mt-2 max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
        That URL doesn’t match anything in this Gadget Grove demo. Head back to the
        storefront or the Demo Hub.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link to="/gadget-grove">Back to Gadget Grove</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}

/** 404 inside the Gadget Grove demo (uses demo chrome via layout + PageShell). */
export function GadgetGroveNotFoundPage({ withShell = true }: GadgetGroveProps) {
  if (!withShell) {
    return <GadgetGroveNotFoundContent />;
  }

  return (
    <PageShell>
      <GadgetGroveNotFoundContent />
    </PageShell>
  );
}

/** 404 outside any demo — no header, no footer. */
export function GenericNotFoundPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        That URL doesn’t match anything in this app.
      </p>
      <p className="mt-6 flex flex-wrap gap-4 text-sm">
        <Link to="/" className="text-primary underline">
          Go home
        </Link>
        <Link to="/gadget-grove" className="text-primary underline">
          Gadget Grove
        </Link>
      </p>
    </main>
  );
}
