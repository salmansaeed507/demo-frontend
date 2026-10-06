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
import type { Order, OrderStatus } from "../store/types";
import { useOrdersStore } from "../store/ordersStore";
import { useProductsStore } from "../store/productsStore";
import DomainLoadState from "./DomainLoadState";
import OrderFormDialog from "./OrderFormDialog";
import OrderTableRow from "./OrderListItem";
import PanelShell from "./PanelShell";

const STATUSES: OrderStatus[] = [
  "processing",
  "out_for_delivery",
  "delivered",
  "refunded",
  "cancelled",
];

function statusLabel(s: OrderStatus | "All") {
  if (s === "All") return "All";
  return s.replaceAll("_", " ");
}

export default function OrdersPanel() {
  const orders = useOrdersStore((s) => s.orders);
  const status = useOrdersStore((s) => s.status);
  const error = useOrdersStore((s) => s.error);
  const load = useOrdersStore((s) => s.load);
  const loadProducts = useProductsStore((s) => s.load);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | OrderStatus>("All");

  useEffect(() => {
    void load();
    void loadProducts();
  }, [load, loadProducts]);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(o: Order) {
    setEditing(o);
    setOpen(true);
  }

  const counts = useMemo(() => {
    const next: Record<string, number> = { All: orders.length };
    for (const s of STATUSES) {
      next[s] = orders.filter((o) => o.status === s).length;
    }
    return next;
  }, [orders]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const inStatus =
        statusFilter === "All" || o.status === statusFilter;
      const inQ =
        !q ||
        `${o.id} ${o.customer} ${o.email}`.toLowerCase().includes(q);
      return inStatus && inQ;
    });
  }, [orders, query, statusFilter]);

  const waiting = counts.processing ?? 0;

  return (
    <PanelShell
      title="Orders"
      description={
        status === "ready"
          ? `${waiting} waiting to be processed.`
          : "Manage order records the agent can look up in chat."
      }
      action={
        <Button
          size="sm"
          type="button"
          onClick={openCreate}
          disabled={status !== "ready"}
        >
          <Plus data-icon="inline-start" />
          New order
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
                  {statusLabel(s)}
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
            placeholder="Search orders or customers"
            aria-label="Search orders"
            className="w-full max-w-[280px]"
          />
        </div>

        <div className="mb-12 overflow-x-auto rounded-2xl border border-border bg-card">
          <Table className="min-w-[620px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {(
                  [
                    "Order",
                    "Date",
                    "Customer",
                    "Items",
                    "Total",
                    "Status",
                    "",
                  ] as const
                ).map((label) => (
                  <TableHead
                    key={label || "actions"}
                    className={cn(
                      "bg-foreground/[0.03] px-4 text-[0.86rem] font-semibold whitespace-nowrap text-muted-foreground",
                      label === "Total" && "text-right",
                    )}
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
                    No orders match. Try a different status or search.
                  </td>
                </TableRow>
              ) : (
                rows.map((o) => (
                  <OrderTableRow
                    key={o.id}
                    order={o}
                    onEdit={openEdit}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DomainLoadState>

      <OrderFormDialog open={open} onOpenChange={setOpen} editing={editing} />
    </PanelShell>
  );
}
