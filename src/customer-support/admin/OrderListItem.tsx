import { useState } from "react";
import { Loader2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatPrice } from "../mock/products";
import type { Order, OrderStatus } from "../store/types";
import { useOrdersStore } from "../store/ordersStore";

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

function fmtDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function OrderListItem({ order, onEdit }: Props) {
  const updateOrder = useOrdersStore((s) => s.updateOrder);
  const deleteOrder = useOrdersStore((s) => s.deleteOrder);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const busy = updating || deleting;

  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  async function onStatusChange(status: OrderStatus) {
    if (busy || status === order.status) return;
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
    <TableRow>
      <TableCell className="px-4 py-3">
        <button
          type="button"
          className="font-semibold text-foreground underline-offset-2 hover:underline"
          onClick={() => onEdit(order)}
        >
          #{order.id}
        </button>
      </TableCell>
      <TableCell className="px-4 py-3 text-[0.94rem] whitespace-nowrap">
        {fmtDate(order.placedAt)}
      </TableCell>
      <TableCell className="px-4 py-3">
        <div className="font-medium text-foreground">{order.customer}</div>
        <div className="text-[0.84rem] text-muted-foreground">{order.email}</div>
      </TableCell>
      <TableCell className="px-4 py-3 text-[0.94rem]">
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </TableCell>
      <TableCell className="px-4 py-3 text-right text-[0.94rem] tabular-nums">
        {formatPrice(order.total)}
      </TableCell>
      <TableCell className="px-4 py-3">
        <div className="flex items-center gap-2">
          <select
            className={cn(
              "rounded-[10px] border border-border bg-card px-2 py-1 text-[0.9rem] capitalize",
              updating && "opacity-60",
            )}
            value={order.status}
            disabled={busy}
            onChange={(e) =>
              void onStatusChange(e.target.value as OrderStatus)
            }
            aria-label={`Status for ${order.id}`}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          {updating ? (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          ) : null}
        </div>
      </TableCell>
      <TableCell className="px-4 py-3">
        <div className="flex justify-end gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => onEdit(order)}
          >
            Edit
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
                size="sm"
                variant="destructive"
                disabled={busy}
              >
                {deleting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
            }
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
