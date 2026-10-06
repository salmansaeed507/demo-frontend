import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatPrice, type Product } from "../mock/products";
import ProductImage from "../ProductImage";
import { useProductsStore } from "../store/productsStore";

type Props = {
  product: Product;
  onEdit: (product: Product) => void;
};

function stockBadge(n: number) {
  if (n <= 0) {
    return (
      <span className="inline-block rounded-full bg-destructive/18 px-2.5 py-0.5 text-[0.82rem] font-semibold text-destructive">
        Sold out
      </span>
    );
  }
  if (n <= 5) {
    return (
      <span className="inline-block rounded-full bg-ring/22 px-2.5 py-0.5 text-[0.82rem] font-semibold text-ring">
        {n} left
      </span>
    );
  }
  return null;
}

export default function ProductListItem({ product, onEdit }: Props) {
  const updateProduct = useProductsStore((s) => s.updateProduct);
  const deleteProduct = useProductsStore((s) => s.deleteProduct);
  const [deleting, setDeleting] = useState(false);
  const [stock, setStock] = useState(String(product.stock));
  const [savingStock, setSavingStock] = useState(false);

  useEffect(() => {
    setStock(String(product.stock));
  }, [product.stock]);

  async function onDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteProduct(product.id);
    } finally {
      setDeleting(false);
    }
  }

  async function commitStock() {
    const next = Math.max(0, parseInt(stock, 10) || 0);
    setStock(String(next));
    if (next === product.stock) return;
    setSavingStock(true);
    try {
      await updateProduct(product.id, { stock: next });
    } catch {
      setStock(String(product.stock));
    } finally {
      setSavingStock(false);
    }
  }

  return (
    <TableRow>
      <TableCell className="px-4 py-3">
        <div className="flex items-center gap-3">
          <ProductImage
            imageKey={product.imageUrl}
            alt=""
            className="size-[38px] shrink-0 rounded-[10px] object-cover"
          />
          <div className="min-w-0">
            <div className="truncate font-semibold text-foreground">
              {product.name}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 text-[0.94rem]">
        {product.category}
      </TableCell>
      <TableCell className="px-4 py-3 text-right text-[0.94rem] tabular-nums">
        {formatPrice(product.price)}
      </TableCell>
      <TableCell className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Input
            type="number"
            min={0}
            step={1}
            value={stock}
            disabled={savingStock || deleting}
            aria-label={`Stock for ${product.name}`}
            className="w-[84px] px-2.5 py-1.5"
            onChange={(e) => setStock(e.target.value)}
            onBlur={() => void commitStock()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
          />
          {stockBadge(product.stock)}
        </div>
      </TableCell>
      <TableCell className="px-4 py-3">
        <div className="flex justify-end gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={deleting}
            onClick={() => onEdit(product)}
          >
            Edit
          </Button>
          <ConfirmDialog
            title="Delete product"
            description={`Delete “${product.name}”? This cannot be undone.`}
            confirmLabel="Confirm delete"
            pending={deleting}
            onConfirm={onDelete}
            trigger={
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={deleting}
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
