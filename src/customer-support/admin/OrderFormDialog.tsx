import { FormEvent, useEffect, useState } from "react";
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
import type { Order, OrderStatus } from "../store/types";
import { useOrdersStore } from "../store/ordersStore";
import { fieldClass } from "./styles";

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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Order | null;
};

export default function OrderFormDialog({
  open,
  onOpenChange,
  editing,
}: Props) {
  const createOrder = useOrdersStore((s) => s.createOrder);
  const updateOrder = useOrdersStore((s) => s.updateOrder);
  const [form, setForm] = useState<FormState>(empty);

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? {
            customer: editing.customer,
            email: editing.email,
            phone: editing.phone,
            shippingAddress: editing.shippingAddress,
            items: editing.items,
            total: String(editing.total),
            status: editing.status,
            shippingMethod: editing.shippingMethod,
            carrier: editing.carrier === "—" ? "" : editing.carrier,
            trackingNumber: editing.trackingNumber,
            paymentMethod: editing.paymentMethod,
            placedAt: editing.placedAt,
          }
        : empty,
    );
  }, [open, editing]);

  async function onSubmit(e: FormEvent) {
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
    if (editing) await updateOrder(editing.id, payload);
    else await createOrder(payload);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
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
  );
}
