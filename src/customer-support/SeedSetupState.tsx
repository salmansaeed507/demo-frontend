import { useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSeedStatusStore } from "./store/seedStatusStore";

/** Restart a failed background seed; `retrying` while the request is in flight. */
export function useSeedRetry() {
  const [retrying, setRetrying] = useState(false);

  async function retry() {
    setRetrying(true);
    try {
      await useSeedStatusStore.getState().retry();
    } catch (err) {
      console.error("Failed to restart demo data setup", err);
    } finally {
      setRetrying(false);
    }
  }

  return { retry, retrying };
}

/** Full-area placeholder shown instead of a page while demo data is seeding. */
export default function SeedSetupState({
  status,
}: {
  status: "pending" | "failed";
}) {
  const { retry, retrying } = useSeedRetry();

  return (
    <div
      role="status"
      className="flex min-h-[min(420px,60svh)] flex-col items-center justify-center gap-3 px-4 py-10 text-center"
    >
      {status === "pending" ? (
        <>
          <Loader2 className="size-7 animate-spin text-muted-foreground" />
          <h2 className="font-heading text-xl leading-tight tracking-tight text-foreground">
            Setting up your demo data…
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Adding sample products, orders, tickets and knowledge docs. This
            only takes a few seconds.
          </p>
        </>
      ) : (
        <>
          <AlertCircle className="size-7 text-destructive" />
          <h2 className="font-heading text-xl leading-tight tracking-tight text-foreground">
            Couldn&apos;t set up your demo data
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Something went wrong while adding the sample data. Try again.
          </p>
          <Button
            type="button"
            size="sm"
            onClick={() => void retry()}
            disabled={retrying}
          >
            {retrying ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            Retry
          </Button>
        </>
      )}
    </div>
  );
}
