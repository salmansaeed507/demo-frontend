import { useEffect, useState } from "react";
import { Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SupportTicket } from "../store/types";
import { useTicketsStore } from "../store/ticketsStore";
import DomainLoadState from "./DomainLoadState";
import PanelShell from "./PanelShell";
import TicketFormDialog from "./TicketFormDialog";
import TicketListItem from "./TicketListItem";

export default function TicketsPanel() {
  const tickets = useTicketsStore((s) => s.tickets);
  const status = useTicketsStore((s) => s.status);
  const error = useTicketsStore((s) => s.error);
  const load = useTicketsStore((s) => s.load);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SupportTicket | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(t: SupportTicket) {
    setEditing(t);
    setOpen(true);
  }

  const openCount = tickets.filter((t) => t.status === "open").length;
  const highCount = tickets.filter((t) => t.priority === "high").length;

  return (
    <PanelShell
      icon={Ticket}
      title="Tickets"
      description="Create, update status/priority, or close tickets the agent can escalate to."
      stats={[
        { label: "Total", value: tickets.length },
        { label: "Open", value: openCount },
        { label: "High priority", value: highCount },
      ]}
      action={
        <Button
          size="sm"
          type="button"
          className="bg-teal-800 text-white hover:bg-teal-700"
          onClick={openCreate}
          disabled={status !== "ready"}
        >
          <Plus data-icon="inline-start" />
          New ticket
        </Button>
      }
    >
      <DomainLoadState
        status={status}
        error={error}
        onRetry={() => void load({ force: true })}
      >
        <ul className="space-y-2">
          {tickets.length === 0 ? (
            <li className="rounded-xl border border-dashed border-zinc-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
              No tickets. Create one or ask the agent to “create ticket …”.
            </li>
          ) : (
            tickets.map((t) => (
              <TicketListItem key={t.id} ticket={t} onEdit={openEdit} />
            ))
          )}
        </ul>
      </DomainLoadState>

      <TicketFormDialog open={open} onOpenChange={setOpen} editing={editing} />
    </PanelShell>
  );
}
