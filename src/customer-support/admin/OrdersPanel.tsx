import { FormEvent, useState } from "react";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
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
import { formatPrice } from "../mock/products";
import {
  useShopPilot,
  type Order,
  type OrderStatus,
} from "../store/ShopPilotStore";
import PanelShell from "./PanelShell";
import { fieldClass, statusClass } from "./styles";

type FormState = {
  customer: string;
  email: string;
  phone: string;
  shippingAddress: string;
  items: string;
  total: string;
  status: OrderStatus;
  shippingMethod: string;
  carrier: string;
  trackingNumber: string;
  paymentMethod: string;
  placedAt: string;
};

const empty: FormState = {
  customer: "",
  email: "",
  phone: "",
  shippingAddress: "",
  items: "",
  total: "",
  status: "processing",
  shippingMethod: "Standard",
  carrier: "",
  trackingNumber: "Pending",
  paymentMethod: "",
  placedAt: new Date().toISOString().slice(0, 10),
};

const statuses: OrderStatus[] = [
  "processing",
  "out_for_delivery",
  "delivered",
  "refunded",
  "cancelled",
];

function Detail({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-[13px] leading-snug text-slate-700">{value}</dd>
    </div>
  );
}

export default function OrdersPanel() {
  const { orders, createOrder, updateOrder, deleteOrder } = useShopPilot();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }

  function openEdit(o: Order) {
    setEditing(o);
    setForm({
      customer: o.customer,
      email: o.email,
      phone: o.phone,
      shippingAddress: o.shippingAddress,
      items: o.items,
      total: String(o.total),
      status: o.status,
      shippingMethod: o.shippingMethod,
      carrier: o.carrier === "—" ? "" : o.carrier,
      trackingNumber: o.trackingNumber,
      paymentMethod: o.paymentMethod,
      placedAt: o.placedAt,
    });
    setOpen(true);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.customer.trim() || !form.items.trim()) return;
    const payload = {
      customer: form.customer.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      shippingAddress: form.shippingAddress.trim(),
      items: form.items.trim(),
      total: Number(form.total) || 0,
      status: form.status,
      shippingMethod: form.shippingMethod.trim() || "Standard",
      carrier: form.carrier.trim() || "—",
      trackingNumber: form.trackingNumber.trim() || "Pending",
      paymentMethod: form.paymentMethod.trim(),
      placedAt: form.placedAt,
    };
    if (editing) updateOrder(editing.id, payload);
    else createOrder(payload);
    setOpen(false);
  }

  const inFlight = orders.filter(
    (o) => o.status === "processing" || o.status === "out_for_delivery",
  ).length;
  const delivered = orders.filter((o) => o.status === "delivered").length;

  return (
    <PanelShell
      icon={Package}
      title="Orders"
      description="Manage order records the agent can look up in chat."
      stats={[
        { label: "Total", value: orders.length },
        { label: "In flight", value: inFlight },
        { label: "Delivered", value: delivered },
      ]}
      action={
        <Button
          size="sm"
          type="button"
          className="bg-teal-800 text-white hover:bg-teal-700"
          onClick={openCreate}
        >
          <Plus data-icon="inline-start" />
          New order
        </Button>
      }
    >
      <ul className="space-y-2">
        {orders.length === 0 ? (
          <li className="rounded-xl border border-dashed border-zinc-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
            No orders yet. Create one so the agent can look it up in chat.
          </li>
        ) : (
          orders.map((o) => (
            <li
              key={o.id}
              className="rounded-xl border border-zinc-200/80 bg-white px-4 py-3 shadow-sm shadow-zinc-900/[0.03]"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded bg-teal-900/[0.06] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-teal-900/80">
                  #{o.id}
                </span>
                <select
                  className={cn(
                    "h-7 max-w-[9.5rem] rounded-md border px-1.5 text-xs capitalize",
                    statusClass(o.status),
                  )}
                  value={o.status}
                  onChange={(e) =>
                    updateOrder(o.id, {
                      status: e.target.value as OrderStatus,
                    })
                  }
                  aria-label="Status"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
                <span className="ml-auto text-sm font-semibold tabular-nums text-slate-900">
                  {formatPrice(o.total)}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  aria-label="Edit"
                  onClick={() => openEdit(o)}
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
                    if (confirm(`Delete order #${o.id}?`)) deleteOrder(o.id);
                  }}
                >
                  <Trash2 className="size-3.5 text-rose-600" />
                </Button>
              </div>

              <p className="text-sm font-medium text-slate-900">{o.items}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {o.customer}
                {o.email ? ` · ${o.email}` : ""}
                {o.phone ? ` · ${o.phone}` : ""}
              </p>

              <dl className="mt-3 grid gap-2.5 border-t border-zinc-100 pt-3 sm:grid-cols-2">
                <Detail label="Shipping address" value={o.shippingAddress} />
                <Detail label="Shipping method" value={o.shippingMethod} />
                <Detail label="Carrier" value={o.carrier} />
                <Detail label="Tracking" value={o.trackingNumber} />
                <Detail label="Payment" value={o.paymentMethod} />
                <Detail label="Placed" value={o.placedAt} />
              </dl>
            </li>
          ))
        )}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-1.5rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit order" : "New order"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="o-customer">Customer</Label>
              <input
                id="o-customer"
                className={fieldClass()}
                value={form.customer}
                onChange={(e) => setForm({ ...form, customer: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="o-email">Email</Label>
                <input
                  id="o-email"
                  type="email"
                  className={fieldClass()}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="o-phone">Phone</Label>
                <input
                  id="o-phone"
                  className={fieldClass()}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="o-address">Shipping address</Label>
              <textarea
                id="o-address"
                className={cn(fieldClass(), "h-16 py-2")}
                value={form.shippingAddress}
                onChange={(e) =>
                  setForm({ ...form, shippingAddress: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="o-items">Items</Label>
              <input
                id="o-items"
                className={fieldClass()}
                value={form.items}
                onChange={(e) => setForm({ ...form, items: e.target.value })}
                placeholder="Product × qty"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="o-total">Total</Label>
                <input
                  id="o-total"
                  type="number"
                  min={0}
                  step="0.01"
                  className={fieldClass()}
                  value={form.total}
                  onChange={(e) => setForm({ ...form, total: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="o-date">Placed</Label>
                <input
                  id="o-date"
                  type="date"
                  className={fieldClass()}
                  value={form.placedAt}
                  onChange={(e) =>
                    setForm({ ...form, placedAt: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <select
                className={fieldClass()}
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as OrderStatus,
                  })
                }
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="o-ship">Shipping method</Label>
                <input
                  id="o-ship"
                  className={fieldClass()}
                  value={form.shippingMethod}
                  onChange={(e) =>
                    setForm({ ...form, shippingMethod: e.target.value })
                  }
                  placeholder="Standard"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="o-carrier">Carrier</Label>
                <input
                  id="o-carrier"
                  className={fieldClass()}
                  value={form.carrier}
                  onChange={(e) =>
                    setForm({ ...form, carrier: e.target.value })
                  }
                  placeholder="UPS"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="o-tracking">Tracking</Label>
                <input
                  id="o-tracking"
                  className={fieldClass()}
                  value={form.trackingNumber}
                  onChange={(e) =>
                    setForm({ ...form, trackingNumber: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="o-pay">Payment</Label>
                <input
                  id="o-pay"
                  className={fieldClass()}
                  value={form.paymentMethod}
                  onChange={(e) =>
                    setForm({ ...form, paymentMethod: e.target.value })
                  }
                  placeholder="Visa ···· 4242"
                />
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
