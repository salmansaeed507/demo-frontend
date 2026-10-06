import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { SupportTicket } from "../store/types";
import { useTicketsStore } from "../store/ticketsStore";
import DomainLoadState from "./DomainLoadState";
import PanelShell from "./PanelShell";
import TicketFormDialog from "./TicketFormDialog";
import TicketTableRow from "./TicketListItem";

type TicketStatus = SupportTicket["status"];

const STATUSES: TicketStatus[] = ["open", "pending", "resolved"];

export default function TicketsPanel() {
  const tickets = useTicketsStore((s) => s.tickets);
  const status = useTicketsStore((s) => s.status);
  const error = useTicketsStore((s) => s.error);
  const load = useTicketsStore((s) => s.load);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SupportTicket | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | TicketStatus>(
    "All",
  );

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

  const counts = useMemo(() => {
    const next: Record<string, number> = { All: tickets.length };
    for (const s of STATUSES) {
      next[s] = tickets.filter((t) => t.status === s).length;
    }
    return next;
  }, [tickets]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tickets.filter((t) => {
      const inStatus = statusFilter === "All" || t.status === statusFilter;
      const inQ =
        !q ||
        `${t.id} ${t.customer} ${t.summary}`.toLowerCase().includes(q);
      return inStatus && inQ;
    });
  }, [tickets, query, statusFilter]);

  const openCount = counts.open ?? 0;

  return (
    <PanelShell
      title="Tickets"
      description={
        status === "ready"
          ? `${openCount} open ticket${openCount === 1 ? "" : "s"}.`
          : "Create, update status/priority, or close tickets the agent can escalate to."
      }
      action={
        <Button
          size="sm"
          type="button"
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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(["All", ...STATUSES] as const).map((s) => {
              const pressed = s === statusFilter;
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition-colors",
                    pressed
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-foreground hover:border-foreground/40",
                  )}
                >
                  {s}
                  <span
                    className={cn(
                      "ml-1",
                      pressed ? "opacity-70" : "text-muted-foreground",
                    )}
                  >
                    {counts[s] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tickets or customers"
            aria-label="Search tickets"
            className="w-full max-w-[280px]"
          />
        </div>

        <div className="mb-12 overflow-x-auto rounded-2xl border border-border bg-card">
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {(
                  [
                    "Ticket",
                    "Customer",
                    "Summary",
                    "Priority",
                    "Status",
                    "Created",
                    "",
                  ] as const
                ).map((label) => (
                  <TableHead
                    key={label || "actions"}
                    className="bg-foreground/[0.03] px-4 text-[0.86rem] font-semibold whitespace-nowrap text-muted-foreground"
                  >
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <td
                    colSpan={7}
                    className="px-4 py-7 text-muted-foreground"
                  >
                    No tickets match. Try a different status or search.
                  </td>
                </TableRow>
              ) : (
                rows.map((t) => (
                  <TicketTableRow
                    key={t.id}
                    ticket={t}
                    onEdit={openEdit}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DomainLoadState>

      <TicketFormDialog open={open} onOpenChange={setOpen} editing={editing} />
    </PanelShell>
  );
}
