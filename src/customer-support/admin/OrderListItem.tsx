import { useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice } from "../mock/products";
import type { Order, OrderStatus } from "../store/types";
import { useOrdersStore } from "../store/ordersStore";
import OrderDetail from "./OrderDetail";
import { statusClass } from "./styles";

const statuses: OrderStatus[] = [
  "processing",
  "out_for_delivery",
  "delivered",
  "refunded",
  "cancelled",
];

type Props = {
  order: Order;
  onEdit: (order: Order) => void;
};

export default function OrderListItem({ order, onEdit }: Props) {
  const updateOrder = useOrdersStore((s) => s.updateOrder);
  const deleteOrder = useOrdersStore((s) => s.deleteOrder);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const busy = updating || deleting;

  async function onStatusChange(status: OrderStatus) {
    if (busy) return;
    setUpdating(true);
    try {
      await updateOrder(order.id, { status });
    } finally {
      setUpdating(false);
    }
  }

  async function onDelete() {
    if (busy) return;
    setDeleting(true);
    try {
      await deleteOrder(order.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <li className="rounded-xl border border-zinc-200/80 bg-white px-4 py-4 shadow-sm shadow-zinc-900/[0.03]">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded bg-teal-900/[0.06] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-teal-900/80">
          #{order.id}
        </span>
        <select
          className={cn(
            "h-7 max-w-[9.5rem] rounded-md border px-1.5 text-xs capitalize",
            statusClass(order.status),
            updating && "opacity-60",
          )}
          value={order.status}
          disabled={busy}
          onChange={(e) =>
            void onStatusChange(e.target.value as OrderStatus)
          }
          aria-label="Status"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        {updating ? (
          <Loader2 className="size-3.5 animate-spin text-blue-500" />
        ) : null}
        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8"
            aria-label="Edit"
            disabled={busy}
            onClick={() => onEdit(order)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <ConfirmDialog
            title="Delete order"
            description={`Delete order #${order.id}? This cannot be undone.`}
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
      </div>

      <div className="grid gap-4 border-t border-zinc-100 pt-3 md:grid-cols-2">
        <section className="space-y-2.5">
          <h3 className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
            Order details
          </h3>
          <dl className="grid gap-2.5 sm:grid-cols-2">
            <OrderDetail label="Customer" value={order.customer} />
            <OrderDetail label="Email" value={order.email} />
            <OrderDetail label="Phone" value={order.phone} />
            <OrderDetail label="Payment" value={order.paymentMethod} />
            <OrderDetail label="Placed" value={order.placedAt} />
          </dl>
        </section>

        <section className="space-y-2.5">
          <h3 className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
            Shipping information
          </h3>
          <dl className="grid gap-2.5 sm:grid-cols-2">
            <OrderDetail
              label="Shipping address"
              value={order.shippingAddress}
            />
            <OrderDetail label="Shipping method" value={order.shippingMethod} />
            <OrderDetail label="Carrier" value={order.carrier} />
            <OrderDetail label="Tracking" value={order.trackingNumber} />
          </dl>
        </section>
      </div>

      <section className="mt-4 space-y-2 border-t border-zinc-100 pt-3">
        <h3 className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
          Products
        </h3>
        {order.items.length === 0 ? (
          <p className="text-sm text-slate-400">No products</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-3 py-2 font-semibold">Product</th>
                  <th className="w-20 px-3 py-2 font-semibold">Qty</th>
                  <th className="w-24 px-3 py-2 font-semibold">Price</th>
                  <th className="w-24 px-3 py-2 text-right font-semibold">
                    Line
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr
                    key={item.id ?? `${item.name}-${index}`}
                    className="border-b border-zinc-100 last:border-0"
                  >
                    <td className="px-3 py-2 font-medium text-slate-900">
                      {item.name}
                    </td>
                    <td className="px-3 py-2 tabular-nums text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-2 tabular-nums text-slate-700">
                      {formatPrice(item.unitPrice)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium text-slate-900">
                      {formatPrice(item.quantity * item.unitPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end">
          <dl className="min-w-[11rem] space-y-1 text-sm">
            <div className="flex items-center justify-between gap-6">
              <dt className="text-slate-500">Total</dt>
              <dd className="text-base font-semibold tabular-nums text-slate-900">
                {formatPrice(order.total)}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </li>
  );
}
