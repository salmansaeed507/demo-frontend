import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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
import type { Product } from "../mock/products";
import { useProductsStore } from "../store/productsStore";
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
    "",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Product | null;
};

export default function ProductFormDialog({
  open,
  onOpenChange,
  editing,
}: Props) {
  const createProduct = useProductsStore((s) => s.createProduct);
  const updateProduct = useProductsStore((s) => s.updateProduct);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSaving(false);
    setForm(
      editing
        ? {
            name: editing.name,
            category: editing.category,
            price: String(editing.price),
            stock: String(editing.stock),
            description: editing.description,
            imageUrl: editing.imageUrl,
          }
        : empty,
    );
  }, [open, editing]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || saving) return;
    const payload = {
      name: form.name.trim(),
      category: form.category.trim() || "General",
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
    };
    setSaving(true);
    try {
      if (editing) await updateProduct(editing.id, payload);
      else await createProduct(payload);
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
      <DialogContent className="max-h-[90vh] w-[calc(100%-1.5rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit product" : "Add product"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <fieldset disabled={saving} className="space-y-3 border-0 p-0">
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
          </fieldset>
          <DialogFooter>
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
