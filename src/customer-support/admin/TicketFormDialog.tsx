import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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
import type { SupportTicket } from "../store/types";
import { useTicketsStore } from "../store/ticketsStore";
import { fieldClass } from "./styles";

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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: SupportTicket | null;
};

export default function TicketFormDialog({
  open,
  onOpenChange,
  editing,
}: Props) {
  const createTicket = useTicketsStore((s) => s.createTicket);
  const updateTicket = useTicketsStore((s) => s.updateTicket);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSaving(false);
    setForm(
      editing
        ? {
            customer: editing.customer,
            summary: editing.summary,
            priority: editing.priority,
            status: editing.status,
          }
        : empty,
    );
  }, [open, editing]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.customer.trim() || !form.summary.trim() || saving) return;
    setSaving(true);
    try {
      if (editing) {
        await updateTicket(editing.id, form);
      } else {
        await createTicket({ ...form, conversationId: `conv-${Date.now()}` });
      }
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (saving) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[90vh] w-[calc(100%-1.5rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit ticket" : "New ticket"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <fieldset disabled={saving} className="space-y-3 border-0 p-0">
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
          </fieldset>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-teal-800 text-white hover:bg-teal-700"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : editing ? (
                "Save"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
