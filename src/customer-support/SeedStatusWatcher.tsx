import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "../auth/authStore";
import { useSeedRetry } from "./SeedSetupState";
import { useSeedStatusStore } from "./store/seedStatusStore";

/**
 * Demo data is seeded by a background job after login. Polls its status for
 * the signed-in session (pages reload their data when it finishes — see
 * seedStatusStore) and shows a small progress / failure notice meanwhile.
 * The admin dashboard shows its own full-area state (SeedSetupState) instead.
 */
export default function SeedStatusWatcher() {
  const token = useAuthStore((s) => s.session?.token ?? null);
  const status = useSeedStatusStore((s) => s.status);
  const { retry, retrying } = useSeedRetry();
  const isAdmin = useLocation().pathname.includes("/gadget-grove/admin");

  useEffect(() => {
    if (!token) return;
    useSeedStatusStore.getState().watch();
    return () => useSeedStatusStore.getState().stop();
  }, [token]);

  if (!token || isAdmin || (status !== "pending" && status !== "failed")) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground shadow-lg"
    >
      {status === "pending" ? (
        <>
          <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
          Setting up your demo data…
        </>
      ) : (
        <>
          <AlertCircle className="size-4 shrink-0 text-destructive" />
          Couldn&apos;t set up demo data.
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-auto px-2.5 py-1 text-xs"
            onClick={() => void retry()}
            disabled={retrying}
          >
            Retry
          </Button>
        </>
      )}
    </div>
  );
}
