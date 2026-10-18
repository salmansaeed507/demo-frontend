import { Link } from "react-router-dom";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import PageShell from "../PageShell";
import ProductImage from "../ProductImage";
import {
  cartLinesWithProducts,
  cartSubtotal,
  useCartStore,
} from "../store/cartStore";
import { useProductQuickViewStore } from "../store/productQuickViewStore";
import { formatPrice } from "../mock/products";
import { useProductsStore } from "../store/productsStore";

export default function CartPage() {
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const openQuickView = useProductQuickViewStore((s) => s.open);
  const products = useProductsStore((s) => s.products);
  const linesWithProducts = cartLinesWithProducts(lines, products);
  const subtotal = cartSubtotal(linesWithProducts);

  if (linesWithProducts.length === 0) {
    return (
      <PageShell showHero={false}>
        <div className="flex min-h-[40vh] flex-col justify-center py-8">
          <p className="text-sm font-medium tracking-wide text-primary uppercase">
            Cart
          </p>
          <h2 className="font-heading mt-2 text-[clamp(1.8rem,3vw,2.6rem)] tracking-[-0.02em] text-foreground">
            Your cart is empty
          </h2>
          <p className="mt-2 max-w-lg text-muted-foreground">
            Add items from the catalog to continue the demo checkout flow.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link to="/gadget-grove">Browse products</Link>
            </Button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell showHero={false}>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-0 divide-y divide-border overflow-hidden rounded-[20px] border border-border bg-card">
            {linesWithProducts.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <button
                    type="button"
                    onClick={() => openQuickView(product.id)}
                    className="size-20 shrink-0 overflow-hidden rounded-md bg-muted sm:size-24"
                  >
                    <ProductImage
                      imageKey={product.imageUrl}
                      alt={product.name}
                      className="size-full object-cover transition-opacity hover:opacity-90"
                    />
                  </button>
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => openQuickView(product.id)}
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {product.name}
                    </button>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {product.category}
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatPrice(product.price)} each
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-3 sm:shrink-0">
                  <div className="grid gap-1.5">
                    <Label htmlFor={`qty-${product.id}`}>Qty</Label>
                    <Input
                      id={`qty-${product.id}`}
                      type="number"
                      min={1}
                      className="w-20"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(product.id, Number(e.target.value) || 0)
                      }
                    />
                  </div>
                  <p className="min-w-24 pb-2 text-right text-base font-semibold text-foreground">
                    {formatPrice(product.price * quantity)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(product.id)}
                  >
                    <Trash2 data-icon="inline-start" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit space-y-4 rounded-[16px] border border-border bg-card p-5 lg:sticky lg:top-20">
            <h3 className="font-heading text-[1.25rem] text-foreground">
              Order summary
            </h3>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">
                {formatPrice(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium text-foreground">Free (demo)</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-xl font-bold text-foreground">
                {formatPrice(subtotal)}
              </span>
            </div>
            <Button asChild className="w-full" size="lg">
              <Link to="/gadget-grove/checkout">
                <ShoppingCart data-icon="inline-start" />
                Checkout
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/gadget-grove">Continue shopping</Link>
            </Button>
          </aside>
        </div>
    </PageShell>
  );
}
