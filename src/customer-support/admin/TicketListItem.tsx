import { useState } from "react";
import { Loader2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { SupportTicket } from "../store/types";
import { useTicketsStore } from "../store/ticketsStore";

type Props = {
  ticket: SupportTicket;
  onEdit: (ticket: SupportTicket) => void;
};

export default function TicketListItem({ ticket, onEdit }: Props) {
  const updateTicket = useTicketsStore((s) => s.updateTicket);
  const deleteTicket = useTicketsStore((s) => s.deleteTicket);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const busy = updating || deleting;

  async function onPatch(patch: Partial<SupportTicket>) {
    if (busy) return;
    setUpdating(true);
    try {
      await updateTicket(ticket.id, patch);
    } finally {
      setUpdating(false);
    }
  }

  async function onDelete() {
    if (busy) return;
    setDeleting(true);
    try {
      await deleteTicket(ticket.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <TableRow>
      <TableCell className="px-4 py-3">
        <button
          type="button"
          className="font-semibold text-foreground underline-offset-2 hover:underline"
          onClick={() => onEdit(ticket)}
        >
          {ticket.id}
        </button>
      </TableCell>
      <TableCell className="px-4 py-3 text-[0.94rem] font-medium">
        {ticket.customer}
      </TableCell>
      <TableCell className="max-w-[280px] px-4 py-3 text-[0.94rem]">
        <span className="line-clamp-2">{ticket.summary}</span>
      </TableCell>
      <TableCell className="px-4 py-3">
        <select
          className={cn(
            "rounded-[10px] border border-border bg-card px-2 py-1 text-[0.9rem] capitalize",
            updating && "opacity-60",
          )}
          value={ticket.priority}
          disabled={busy}
          onChange={(e) =>
            void onPatch({
              priority: e.target.value as SupportTicket["priority"],
            })
          }
          aria-label={`Priority for ${ticket.id}`}
        >
          <option value="high">high</option>
          <option value="medium">medium</option>
          <option value="low">low</option>
        </select>
      </TableCell>
      <TableCell className="px-4 py-3">
        <div className="flex items-center gap-2">
          <select
            className={cn(
              "rounded-[10px] border border-border bg-card px-2 py-1 text-[0.9rem] capitalize",
              updating && "opacity-60",
            )}
            value={ticket.status}
            disabled={busy}
            onChange={(e) =>
              void onPatch({
                status: e.target.value as SupportTicket["status"],
              })
            }
            aria-label={`Status for ${ticket.id}`}
          >
            <option value="open">open</option>
            <option value="pending">pending</option>
            <option value="resolved">resolved</option>
          </select>
          {updating ? (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          ) : null}
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-[0.94rem] whitespace-nowrap text-muted-foreground">
        {ticket.createdAgo}
      </TableCell>
      <TableCell className="px-4 py-3">
        <div className="flex justify-end gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => onEdit(ticket)}
          >
            Edit
          </Button>
          <ConfirmDialog
            title="Delete ticket"
            description={`Delete ${ticket.id}? This cannot be undone.`}
            confirmLabel="Delete"
            pending={deleting}
            onConfirm={onDelete}
            trigger={
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={busy}
              >
                {deleting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
            }
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
