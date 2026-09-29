import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DomainLoadStatus } from "../store/loadStatus";

type Props = {
  status: DomainLoadStatus;
  error: string | null;
  onRetry: () => void;
  children: ReactNode;
};

export default function DomainLoadState({
  status,
  error,
  onRetry,
  children,
}: Props) {
  if (status === "idle" || status === "loading") {
    return (
      <div className="flex min-h-[12rem] items-center justify-center text-slate-500">
        <Loader2 className="size-12 animate-spin text-blue-500" aria-label="Loading" />
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
