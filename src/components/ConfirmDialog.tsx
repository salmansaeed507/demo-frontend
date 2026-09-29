import { useState, type ReactElement } from "react";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  trigger: ReactElement;
};

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  pending = false,
  destructive = true,
  onConfirm,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const busy = pending || working;

  async function handleConfirm() {
    if (busy) return;
    setWorking(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setWorking(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        setOpen(next);
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{cancelLabel}</AlertDialogCancel>
          <Button
            type="button"
            disabled={busy}
            className={cn(
              destructive
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "bg-teal-800 text-white hover:bg-teal-700",
            )}
            onClick={() => void handleConfirm()}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

