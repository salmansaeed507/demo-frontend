import { Button } from "@/components/ui/button";
import type { DomainLoadStatus } from "../../store/loadStatus";

type Props = {
  status: DomainLoadStatus;
  error: string | null;
  onRetry: () => void;
};

export default function ChatStatus({ status, error, onRetry }: Props) {
  if (status === "idle" || status === "loading") {
    return (
      <div className="flex h-full flex-1 items-center justify-center bg-card text-sm text-muted-foreground">
        Loading chats…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-3 bg-card px-4 text-center">
        <p className="max-w-md text-sm text-destructive">
          {error ?? "Failed to load chats"}
        </p>
        <Button type="button" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  return null;
}
