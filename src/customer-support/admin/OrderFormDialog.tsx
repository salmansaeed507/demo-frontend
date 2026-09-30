import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
      <DialogContent className="flex max-h-[92vh] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="shrink-0 border-b border-zinc-100 px-5 py-4">
          <DialogTitle>{editing ? "Edit order" : "New order"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <fieldset
            disabled={saving}
            className="min-h-0 flex-1 space-y-5 overflow-y-auto border-0 px-5 py-4"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <section className="space-y-3">
                <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Order details
                </h3>
                <div className="space-y-1.5">
                  <Label htmlFor="o-customer">Customer</Label>
                  <input
                    id="o-customer"
                    className={fieldClass()}
                    value={form.customer}
                    onChange={(e) =>
                      setForm({ ...form, customer: e.target.value })
                    }
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
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="o-phone">Phone</Label>
                    <input
                      id="o-phone"
                      className={fieldClass()}
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
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
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Shipping information
                </h3>
                <div className="space-y-1.5">
                  <Label htmlFor="o-address">Shipping address</Label>
                  <textarea
                    id="o-address"
                    className={cn(fieldClass(), "h-20 py-2")}
                    value={form.shippingAddress}
                    onChange={(e) =>
                      setForm({ ...form, shippingAddress: e.target.value })
                    }
                  />
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
              </section>
            </div>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Products
                </h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addLine}
                >
                  <Plus data-icon="inline-start" />
                  Add row
                </Button>
              </div>

              <div className="rounded-lg border border-zinc-200">
                <table className="w-full min-w-[36rem] text-left text-sm">
                  <thead className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Product</th>
                      <th className="w-24 px-3 py-2 font-semibold">Qty</th>
                      <th className="w-28 px-3 py-2 font-semibold">Price</th>
                      <th className="w-28 px-3 py-2 text-right font-semibold">
                        Line
                      </th>
                      <th className="w-12 px-2 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line) => (
                      <tr
                        key={line.key}
                        className="border-b border-zinc-100 focus-within:relative focus-within:z-30 last:border-0"
                      >
                        <td className="relative z-10 px-3 py-2 align-top">
                          <ProductAutocomplete
                            value={line.name}
                            disabled={saving}
                            excludeIds={selectedProductIds.filter(
                              (id) => id !== line.productId,
                            )}
                            onSelect={(product) =>
                              selectProduct(line.key, product)
                            }
                          />
                        </td>
                        <td className="px-3 py-2 align-top">
                          <input
                            type="number"
                            min={1}
                            className={fieldClass()}
                            value={line.quantity}
                            onChange={(e) =>
                              updateLine(line.key, {
                                quantity: Math.max(
                                  1,
                                  Number(e.target.value) || 1,
                                ),
                              })
                            }
                          />
                        </td>
                        <td className="px-3 py-2 align-top">
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            className={fieldClass()}
                            value={line.unitPrice}
                            onChange={(e) =>
                              updateLine(line.key, {
                                unitPrice: Number(e.target.value) || 0,
                              })
                            }
                          />
                        </td>
                        <td className="px-3 py-2 text-right align-middle tabular-nums font-medium text-slate-900">
                          {formatPrice(line.quantity * line.unitPrice)}
                        </td>
                        <td className="px-2 py-2 align-middle">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-8"
                            aria-label="Remove row"
                            onClick={() => removeLine(line.key)}
                          >
                            <Trash2 className="size-3.5 text-rose-600" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <dl className="min-w-[12rem] space-y-1 text-sm">
                  <div className="flex items-center justify-between gap-6">
                    <dt className="text-slate-500">Subtotal</dt>
                    <dd className="tabular-nums text-slate-700">
                      {formatPrice(total)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-6 border-t border-zinc-100 pt-2">
                    <dt className="font-semibold text-slate-900">Total</dt>
                    <dd className="text-base font-semibold tabular-nums text-slate-900">
                      {formatPrice(total)}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>
          </fieldset>

          <DialogFooter className="shrink-0 border-t border-zinc-100 px-5 py-4">
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
