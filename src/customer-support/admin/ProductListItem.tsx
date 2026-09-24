import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice, type Product } from "../mock/products";
import { useProductsStore } from "../store/productsStore";

type Props = {
  product: Product;
  onEdit: (product: Product) => void;
};

export default function ProductListItem({ product, onEdit }: Props) {
  const deleteProduct = useProductsStore((s) => s.deleteProduct);

  return (
    <li className="flex gap-3 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-sm shadow-zinc-900/[0.03]">
      <img
        src={product.imageUrl}
        alt=""
        className="size-16 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">
          {product.name}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          {product.category} · stock{" "}
          <span
            className={cn(
              "font-medium tabular-nums",
              product.stock < 15 ? "text-amber-700" : "text-slate-600",
            )}
          >
            {product.stock}
          </span>
        </p>
        <p className="mt-1.5 text-sm font-semibold tabular-nums text-slate-900">
          {formatPrice(product.price)}
        </p>
      </div>
      <div className="flex flex-col gap-0.5">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-8"
          aria-label="Edit"
          onClick={() => onEdit(product)}
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
            if (confirm(`Delete ${product.name}?`)) {
              void deleteProduct(product.id);
            }
          }}
        >
          <Trash2 className="size-3.5 text-rose-600" />
        </Button>
      </div>
    </li>
  );
}
