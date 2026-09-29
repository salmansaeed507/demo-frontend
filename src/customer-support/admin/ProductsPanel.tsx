import { useEffect, useState } from "react";
import { Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "../mock/products";
import { useProductsStore } from "../store/productsStore";
import DomainLoadState from "./DomainLoadState";
import PanelShell from "./PanelShell";
import ProductFormDialog from "./ProductFormDialog";
import ProductListItem from "./ProductListItem";

export default function ProductsPanel() {
  const products = useProductsStore((s) => s.products);
  const status = useProductsStore((s) => s.status);
  const error = useProductsStore((s) => s.error);
  const load = useProductsStore((s) => s.load);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setOpen(true);
  }

  const lowStock = products.filter((p) => p.stock < 15).length;
  const categories = new Set(products.map((p) => p.category)).size;

  return (
    <PanelShell
      icon={ShoppingBag}
      title="Products"
      description="Catalog the agent and storefront share — edits apply live."
      stats={[
        { label: "SKUs", value: products.length },
        { label: "Categories", value: categories },
        { label: "Low stock", value: lowStock },
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
          Add product
        </Button>
      }
    >
      <DomainLoadState
        status={status}
        error={error}
        onRetry={() => void load({ force: true })}
      >
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {products.length === 0 ? (
            <li className="col-span-full rounded-xl border border-dashed border-zinc-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
              No products. Add one to populate the catalog.
            </li>
          ) : (
            products.map((p) => (
              <ProductListItem key={p.id} product={p} onEdit={openEdit} />
            ))
          )}
        </ul>
      </DomainLoadState>

      <ProductFormDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
      />
    </PanelShell>
  );
}
