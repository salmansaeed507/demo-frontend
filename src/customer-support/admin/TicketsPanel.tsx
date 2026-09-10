import { FormEvent, useState } from "react";
import { Pencil, Plus, Ticket, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useShopPilot, type SupportTicket } from "../store/ShopPilotStore";
import PanelShell from "./PanelShell";
import { fieldClass, priorityClass, statusClass } from "./styles";

type FormState = {
  customer: string;
  summary: string;
  priority: SupportTicket["priority"];
  status: SupportTicket["status"];
};

const empty: FormState = {
  customer: "",
  summary: "",
  priority: "medium",
  status: "open",
};

export default function TicketsPanel() {
  const { tickets, createTicket, updateTicket, deleteTicket } = useShopPilot();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SupportTicket | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }

  function openEdit(t: SupportTicket) {
    setEditing(t);
    setForm({
      customer: t.customer,
      summary: t.summary,
      priority: t.priority,
      status: t.status,
    });
    setOpen(true);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.customer.trim() || !form.summary.trim()) return;
    if (editing) {
      updateTicket(editing.id, form);
    } else {
      createTicket({ ...form, conversationId: `conv-${Date.now()}` });
    }
    setOpen(false);
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
        >
          <Plus data-icon="inline-start" />
          New ticket
        </Button>
      }
    >
      <ul className="space-y-2">
        {tickets.length === 0 ? (
          <li className="rounded-xl border border-dashed border-zinc-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
            No tickets. Create one or ask the agent to “create ticket …”.
          </li>
        ) : (
          tickets.map((t) => (
            <li
              key={t.id}
              className="rounded-xl border border-zinc-200/80 bg-white px-4 py-3 shadow-sm shadow-zinc-900/[0.03]"
            >
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="rounded bg-teal-900/[0.06] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-teal-900/80">
                  {t.id}
                </span>
                <select
                  className={cn(
                    "h-7 rounded-md border px-2 text-xs capitalize",
                    priorityClass(t.priority),
                  )}
                  value={t.priority}
                  onChange={(e) =>
                    updateTicket(t.id, {
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
                    statusClass(t.status),
                  )}
                  value={t.status}
                  onChange={(e) =>
                    updateTicket(t.id, {
                      status: e.target.value as SupportTicket["status"],
                    })
                  }
                  aria-label="Status"
                >
                  <option value="open">open</option>
                  <option value="pending">pending</option>
                  <option value="resolved">resolved</option>
                </select>
                <span className="ml-auto text-xs text-slate-400">
                  {t.createdAgo}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  aria-label="Edit"
                  onClick={() => openEdit(t)}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  aria-label="Delete"
                  onClick={() => {
                    if (confirm(`Delete ${t.id}?`)) deleteTicket(t.id);
                  }}
                >
                  <Trash2 className="size-3.5 text-rose-600" />
                </Button>
              </div>
              <p className="text-sm font-medium text-slate-900">{t.summary}</p>
              <p className="mt-0.5 text-xs text-slate-400">{t.customer}</p>
            </li>
          ))
        )}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-1.5rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit ticket" : "New ticket"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="t-customer">Customer</Label>
              <input
                id="t-customer"
                className={fieldClass()}
                value={form.customer}
                onChange={(e) => setForm({ ...form, customer: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-summary">Summary</Label>
              <textarea
                id="t-summary"
                className={cn(fieldClass(), "h-20 py-2")}
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <select
                  className={fieldClass()}
                  value={form.priority}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      priority: e.target.value as FormState["priority"],
                    })
                  }
                >
                  <option value="high">high</option>
                  <option value="medium">medium</option>
                  <option value="low">low</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select
                  className={fieldClass()}
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as FormState["status"],
                    })
                  }
                >
                  <option value="open">open</option>
                  <option value="pending">pending</option>
                  <option value="resolved">resolved</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-teal-800 text-white hover:bg-teal-700"
              >
                {editing ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PanelShell>
  );
}
