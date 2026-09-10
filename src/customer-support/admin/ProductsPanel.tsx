import { FormEvent, useState } from "react";
import { Pencil, Plus, ShoppingBag, Trash2 } from "lucide-react";
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
import { useShopPilot } from "../store/ShopPilotStore";
import PanelShell from "./PanelShell";
import { fieldClass } from "./styles";

type FormState = {
  name: string;
  category: string;
  price: string;
  stock: string;
  description: string;
  imageUrl: string;
};

const empty: FormState = {
  name: "",
  category: "",
  price: "",
  stock: "10",
  description: "",
  imageUrl:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
};

export default function ProductsPanel() {
  const { products, createProduct, updateProduct, deleteProduct } =
    useShopPilot();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      stock: String(p.stock),
      description: p.description,
      imageUrl: p.imageUrl,
    });
    setOpen(true);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      category: form.category.trim() || "General",
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
    };
    if (editing) updateProduct(editing.id, payload);
    else createProduct(payload);
    setOpen(false);
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
        >
          <Plus data-icon="inline-start" />
          Add product
        </Button>
      }
    >
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {products.length === 0 ? (
          <li className="col-span-full rounded-xl border border-dashed border-zinc-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
            No products. Add one to populate the catalog.
          </li>
        ) : (
          products.map((p) => (
            <li
              key={p.id}
              className="flex gap-3 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-sm shadow-zinc-900/[0.03]"
            >
              <img
                src={p.imageUrl}
                alt=""
                className="size-16 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {p.name}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {p.category} · stock{" "}
                  <span
                    className={cn(
                      "font-medium tabular-nums",
                      p.stock < 15 ? "text-amber-700" : "text-slate-600",
                    )}
                  >
                    {p.stock}
                  </span>
                </p>
                <p className="mt-1.5 text-sm font-semibold tabular-nums text-slate-900">
                  {formatPrice(p.price)}
                </p>
              </div>
              <div className="flex flex-col gap-0.5">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  aria-label="Edit"
                  onClick={() => openEdit(p)}
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
                    if (confirm(`Delete ${p.name}?`)) deleteProduct(p.id);
                  }}
                >
                  <Trash2 className="size-3.5 text-rose-600" />
                </Button>
              </div>
            </li>
          ))
        )}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-1.5rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit product" : "Add product"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-name">Name</Label>
              <input
                id="p-name"
                className={fieldClass()}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="p-cat">Category</Label>
                <input
                  id="p-cat"
                  className={fieldClass()}
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-price">Price</Label>
                <input
                  id="p-price"
                  type="number"
                  min={0}
                  step="0.01"
                  className={fieldClass()}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-stock">Stock</Label>
              <input
                id="p-stock"
                type="number"
                min={0}
                className={fieldClass()}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-desc">Description</Label>
              <textarea
                id="p-desc"
                className={cn(fieldClass(), "h-20 py-2")}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-img">Image URL</Label>
              <input
                id="p-img"
                className={fieldClass()}
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
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
