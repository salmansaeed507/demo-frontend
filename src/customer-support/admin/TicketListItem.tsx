import { useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SupportTicket } from "../store/types";
import { useTicketsStore } from "../store/ticketsStore";
import { priorityClass, statusClass } from "./styles";

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
    <li className="rounded-xl border border-zinc-200/80 bg-white px-4 py-3 shadow-sm shadow-zinc-900/[0.03]">
      <div className="mb-1.5 flex flex-wrap items-center gap-2">
        <span className="rounded bg-teal-900/[0.06] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-teal-900/80">
          {ticket.id}
        </span>
        <select
          className={cn(
            "h-7 rounded-md border px-2 text-xs capitalize",
            priorityClass(ticket.priority),
            updating && "opacity-60",
          )}
          value={ticket.priority}
          disabled={busy}
          onChange={(e) =>
            void onPatch({
              priority: e.target.value as SupportTicket["priority"],
            })
          }
          aria-label="Priority"
        >
          <option value="high">high</option>
          <option value="medium">medium</option>
          <option value="low">low</option>
        </select>
        <select
          className={cn(
            "h-7 rounded-md border px-2 text-xs capitalize",
            statusClass(ticket.status),
            updating && "opacity-60",
          )}
          value={ticket.status}
          disabled={busy}
          onChange={(e) =>
            void onPatch({
              status: e.target.value as SupportTicket["status"],
            })
          }
          aria-label="Status"
        >
          <option value="open">open</option>
          <option value="pending">pending</option>
          <option value="resolved">resolved</option>
        </select>
        {updating ? (
          <Loader2 className="size-3.5 animate-spin text-blue-500" />
        ) : null}
        <span className="ml-auto text-xs text-slate-400">{ticket.createdAgo}</span>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-8"
          aria-label="Edit"
          disabled={busy}
          onClick={() => onEdit(ticket)}
        >
          <Pencil className="size-3.5" />
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
              size="icon"
              variant="ghost"
              className="size-8"
              aria-label="Delete"
              disabled={busy}
            >
              {deleting ? (
                <Loader2 className="size-3.5 animate-spin text-rose-600" />
              ) : (
                <Trash2 className="size-3.5 text-rose-600" />
              )}
            </Button>
          }
        />
      </div>
      <p className="text-sm font-medium text-slate-900">{ticket.summary}</p>
      <p className="mt-0.5 text-xs text-slate-400">{ticket.customer}</p>
    </li>
  );
}
