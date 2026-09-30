import { useEffect, useState } from "react";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Order } from "../store/types";
import { useOrdersStore } from "../store/ordersStore";
import { useProductsStore } from "../store/productsStore";
import DomainLoadState from "./DomainLoadState";
import OrderFormDialog from "./OrderFormDialog";
import OrderListItem from "./OrderListItem";
import PanelShell from "./PanelShell";

export default function OrdersPanel() {
  const orders = useOrdersStore((s) => s.orders);
  const status = useOrdersStore((s) => s.status);
  const error = useOrdersStore((s) => s.error);
  const load = useOrdersStore((s) => s.load);
  const loadProducts = useProductsStore((s) => s.load);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);

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
        <ul className="space-y-2">
          {orders.length === 0 ? (
            <li className="rounded-xl border border-dashed border-zinc-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
              No orders yet. Create one so the agent can look it up in chat.
            </li>
          ) : (
            orders.map((o) => (
              <OrderListItem key={o.id} order={o} onEdit={openEdit} />
            ))
          )}
        </ul>
      </DomainLoadState>

      <OrderFormDialog open={open} onOpenChange={setOpen} editing={editing} />
    </PanelShell>
  );
}
