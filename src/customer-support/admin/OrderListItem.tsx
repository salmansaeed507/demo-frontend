import { Pencil, Trash2 } from "lucide-react";
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

  return (
    <li className="rounded-xl border border-zinc-200/80 bg-white px-4 py-3 shadow-sm shadow-zinc-900/[0.03]">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded bg-teal-900/[0.06] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-teal-900/80">
          #{order.id}
        </span>
        <select
          className={cn(
            "h-7 max-w-[9.5rem] rounded-md border px-1.5 text-xs capitalize",
            statusClass(order.status),
          )}
          value={order.status}
          onChange={(e) =>
            void updateOrder(order.id, {
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
          {formatPrice(order.total)}
        </span>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-8"
          aria-label="Edit"
          onClick={() => onEdit(order)}
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
            if (confirm(`Delete order #${order.id}?`)) {
              void deleteOrder(order.id);
            }
          }}
        >
          <Trash2 className="size-3.5 text-rose-600" />
        </Button>
      </div>

      <p className="text-sm font-medium text-slate-900">{order.items}</p>
      <p className="mt-0.5 text-xs text-slate-500">
        {order.customer}
        {order.email ? ` · ${order.email}` : ""}
        {order.phone ? ` · ${order.phone}` : ""}
      </p>

      <dl className="mt-3 grid gap-2.5 border-t border-zinc-100 pt-3 sm:grid-cols-2">
        <OrderDetail label="Shipping address" value={order.shippingAddress} />
        <OrderDetail label="Shipping method" value={order.shippingMethod} />
        <OrderDetail label="Carrier" value={order.carrier} />
        <OrderDetail label="Tracking" value={order.trackingNumber} />
        <OrderDetail label="Payment" value={order.paymentMethod} />
        <OrderDetail label="Placed" value={order.placedAt} />
      </dl>
    </li>
  );
}
