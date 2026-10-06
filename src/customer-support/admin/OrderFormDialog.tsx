import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatPrice, type Product } from "../mock/products";
import type { Order, OrderLineItem, OrderStatus } from "../store/types";
import { useOrdersStore } from "../store/ordersStore";
import { useProductsStore } from "../store/productsStore";
import ProductAutocomplete from "./ProductAutocomplete";
import { fieldClass } from "./styles";

type FormState = {
  customer: string;
  email: string;
  phone: string;
  shippingAddress: string;
  status: OrderStatus;
  shippingMethod: string;
  carrier: string;
  trackingNumber: string;
  paymentMethod: string;
  placedAt: string;
};

type LineDraft = OrderLineItem & { key: string };

const empty: FormState = {
  customer: "",
  email: "",
  phone: "",
  shippingAddress: "",
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

function newLineKey() {
  return `line-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyLine(): LineDraft {
  return {
    key: newLineKey(),
    productId: null,
    name: "",
    quantity: 1,
    unitPrice: 0,
  };
}

function statusLabel(s: OrderStatus) {
  return s.replaceAll("_", " ");
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Order | null;
};

function Field({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 grid gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-[0.92rem] font-medium text-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export default function OrderFormDialog({
  open,
  onOpenChange,
  editing,
}: Props) {
  const createOrder = useOrdersStore((s) => s.createOrder);
  const updateOrder = useOrdersStore((s) => s.updateOrder);
  const loadProducts = useProductsStore((s) => s.load);
  const [form, setForm] = useState<FormState>(empty);
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    void loadProducts();
    setSaving(false);
    setForm(
      editing
        ? {
            customer: editing.customer,
            email: editing.email,
            phone: editing.phone,
            shippingAddress: editing.shippingAddress,
            status: editing.status,
            shippingMethod: editing.shippingMethod,
            carrier: editing.carrier === "—" ? "" : editing.carrier,
            trackingNumber: editing.trackingNumber,
            paymentMethod: editing.paymentMethod,
            placedAt: editing.placedAt,
          }
        : empty,
    );
    setLines(
      editing?.items?.length
        ? editing.items.map((item) => ({
            key: item.id ?? newLineKey(),
            id: item.id,
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          }))
        : [emptyLine()],
    );
  }, [open, editing, loadProducts]);

  const total = useMemo(
    () =>
      lines.reduce(
        (sum, line) => sum + line.quantity * (Number(line.unitPrice) || 0),
        0,
      ),
    [lines],
  );

  const selectedProductIds = useMemo(
    () =>
      lines
        .map((line) => line.productId)
        .filter((id): id is string => Boolean(id)),
    [lines],
  );

  function updateLine(key: string, patch: Partial<LineDraft>) {
    setLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }

  function selectProduct(key: string, product: Product) {
    updateLine(key, {
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      quantity: 1,
    });
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }

  function removeLine(key: string) {
    setLines((prev) =>
      prev.length <= 1 ? [emptyLine()] : prev.filter((line) => line.key !== key),
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const validLines = lines.filter(
      (line) => line.name.trim() && line.quantity > 0,
    );
    if (!form.customer.trim() || validLines.length === 0 || saving) return;

    const payload = {
      customer: form.customer.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      shippingAddress: form.shippingAddress.trim(),
      items: validLines.map((line) => ({
        id: line.id,
        productId: line.productId,
        name: line.name.trim(),
        quantity: line.quantity,
        unitPrice: Number(line.unitPrice) || 0,
      })),
      total: Math.round(total * 100) / 100,
      status: form.status,
      shippingMethod: form.shippingMethod.trim() || "Standard",
      carrier: form.carrier.trim() || "—",
      trackingNumber: form.trackingNumber.trim() || "Pending",
      paymentMethod: form.paymentMethod.trim(),
      placedAt: form.placedAt,
    };

    setSaving(true);
    try {
      if (editing) await updateOrder(editing.id, payload);
      else await createOrder(payload);
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
      <DialogContent className="max-h-[calc(100%-24px)] w-[min(880px,calc(100%-24px))] gap-0 overflow-y-auto border-border bg-card p-[26px] sm:max-w-[880px] sm:rounded-[22px]">
        <form onSubmit={onSubmit} className="space-y-0">
          <fieldset disabled={saving} className="min-w-0 border-0 p-0">
            <div className="mb-4">
              <DialogTitle className="mb-0.5 text-[1.6rem]">
                {editing ? `Order #${editing.id}` : "New order"}
              </DialogTitle>
              {editing ? (
                <p className="text-[0.84rem] text-muted-foreground">
                  Placed {form.placedAt}
                </p>
              ) : (
                <p className="text-[0.84rem] text-muted-foreground">
                  Create an order the agent can look up in chat.
                </p>
              )}
            </div>

            <div className="mt-1 grid gap-x-[18px] gap-y-4 md:grid-cols-2">
              <div>
                <h3 className="mb-3 font-sans text-[0.88rem] font-semibold text-muted-foreground">
                  Customer
                </h3>
                <Field label="Full name" htmlFor="o-customer">
                  <input
                    id="o-customer"
                    className={fieldClass()}
                    value={form.customer}
                    onChange={(e) =>
                      setForm({ ...form, customer: e.target.value })
                    }
                    required
                  />
                </Field>
                <Field label="Email" htmlFor="o-email">
                  <input
                    id="o-email"
                    type="email"
                    className={fieldClass()}
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </Field>
                <Field label="Phone" htmlFor="o-phone">
                  <input
                    id="o-phone"
                    className={fieldClass()}
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </Field>
                <Field label="Status" htmlFor="o_status" className="mb-0">
                  <select
                    id="o_status"
                    className={cn(fieldClass(), "capitalize")}
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
                        {statusLabel(s)}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div>
                <h3 className="mb-3 font-sans text-[0.88rem] font-semibold text-muted-foreground">
                  Shipping details
                </h3>
                <Field label="Delivery address" htmlFor="o-address">
                  <textarea
                    id="o-address"
                    className={cn(fieldClass(), "min-h-[76px] resize-y py-2")}
                    value={form.shippingAddress}
                    onChange={(e) =>
                      setForm({ ...form, shippingAddress: e.target.value })
                    }
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Method" htmlFor="o-ship">
                    <input
                      id="o-ship"
                      className={fieldClass()}
                      value={form.shippingMethod}
                      onChange={(e) =>
                        setForm({ ...form, shippingMethod: e.target.value })
                      }
                      placeholder="Standard"
                    />
                  </Field>
                  <Field label="Carrier" htmlFor="o-carrier">
                    <input
                      id="o-carrier"
                      className={fieldClass()}
                      value={form.carrier}
                      onChange={(e) =>
                        setForm({ ...form, carrier: e.target.value })
                      }
                      placeholder="UPS"
                    />
                  </Field>
                </div>
                <Field label="Placed" htmlFor="o-date" className="mb-0">
                  <input
                    id="o-date"
                    type="date"
                    className={fieldClass()}
                    value={form.placedAt}
                    onChange={(e) =>
                      setForm({ ...form, placedAt: e.target.value })
                    }
                  />
                </Field>
              </div>
            </div>

            <div className="mt-5 border-t border-border pt-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-sans text-[0.88rem] font-semibold text-muted-foreground">
                  Line items
                </h3>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={addLine}
                >
                  <Plus data-icon="inline-start" />
                  Add item
                </Button>
              </div>

              <div className="mb-2">
                {lines.map((line) => (
                  <div
                    key={line.key}
                    className="grid grid-cols-[minmax(0,1fr)_72px_96px_auto_auto] items-center gap-3 py-2.5"
                  >
                    <ProductAutocomplete
                      value={line.name}
                      disabled={saving}
                      excludeIds={selectedProductIds.filter(
                        (id) => id !== line.productId,
                      )}
                      onSelect={(product) => selectProduct(line.key, product)}
                    />
                    <input
                      type="number"
                      min={1}
                      aria-label="Quantity"
                      className={fieldClass()}
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(line.key, {
                          quantity: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                    />
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      aria-label="Unit price"
                      className={fieldClass()}
                      value={line.unitPrice}
                      onChange={(e) =>
                        updateLine(line.key, {
                          unitPrice: Number(e.target.value) || 0,
                        })
                      }
                    />
                    <span className="min-w-[4.5rem] text-right text-sm font-semibold tabular-nums">
                      {formatPrice(line.quantity * line.unitPrice)}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      aria-label="Remove item"
                      onClick={() => removeLine(line.key)}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="ml-auto w-full max-w-[14rem] space-y-1">
                <div className="flex justify-between gap-6 text-[0.94rem]">
                  <span className="text-right">Subtotal</span>
                  <span className="tabular-nums">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between gap-6 text-[1.1rem] font-bold">
                  <span className="text-right">Total</span>
                  <span className="tabular-nums">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </fieldset>

          <div className="mt-5 flex justify-end gap-2 border-t border-border pt-5">
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : editing ? (
                "Save order"
              ) : (
                "Place order"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
