import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { DomainLoadStatus } from "../store/loadStatus";

type Props = {
  status: DomainLoadStatus;
  error: string | null;
  onRetry: () => void;
  loadingLabel?: string;
  children: ReactNode;
};

export default function DomainLoadState({
  status,
  error,
  onRetry,
  loadingLabel = "Loading…",
  children,
}: Props) {
  if (status === "idle" || status === "loading") {
    return (
      <div className="flex min-h-[12rem] items-center justify-center text-sm text-slate-500">
        {loadingLabel}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="max-w-md text-sm text-red-600">
          {error ?? "Something went wrong"}
        </p>
        <Button type="button" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
