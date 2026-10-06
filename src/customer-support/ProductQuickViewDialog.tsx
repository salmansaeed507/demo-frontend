import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import ProductImage from "./ProductImage";
import { formatPrice } from "./mock/products";
import { useCartStore } from "./store/cartStore";
import { useProductQuickViewStore } from "./store/productQuickViewStore";
import { useProductsStore } from "./store/productsStore";

export default function ProductQuickViewDialog() {
  const productId = useProductQuickViewStore((s) => s.productId);
  const openQuickView = useProductQuickViewStore((s) => s.open);
  const close = useProductQuickViewStore((s) => s.close);
  const products = useProductsStore((s) => s.products);
  const getProduct = useProductsStore((s) => s.getProduct);
  const lines = useCartStore((s) => s.lines);
  const addItem = useCartStore((s) => s.addItem);
  const product = productId ? getProduct(productId) : undefined;
  const open = Boolean(productId);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
  }, [productId]);

  const inCart = product
    ? (lines.find((l) => l.productId === product.id)?.quantity ?? 0)
    : 0;
  const room = product ? Math.max(0, product.stock - inCart) : 0;
  const out = product ? product.stock <= 0 : true;

  const pairs = useMemo(() => {
    if (!product) return [];
    return products
      .filter(
        (p) =>
          p.id !== product.id && p.category !== product.category && p.stock > 0,
      )
      .slice(0, 3);
  }, [product, products]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100%-24px)] w-[min(880px,calc(100%-24px))] max-w-[880px] gap-0 overflow-auto p-0 sm:rounded-[22px]"
        aria-describedby={undefined}
      >
        {product ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="absolute top-3.5 right-3.5 z-10"
              onClick={close}
            >
              Close
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <div className="grid min-h-0 place-items-center bg-muted p-9 md:min-h-[340px] md:p-12">
                <ProductImage
                  imageKey={product.imageUrl}
                  alt={product.name}
                  className="max-h-[260px] w-full object-contain md:max-h-[300px]"
                />
              </div>

              <div className="grid content-start gap-3.5 px-[30px] pt-[34px] pb-[30px]">
                <p className="text-[0.84rem] text-muted-foreground">
                  {product.category}
                </p>
                <DialogTitle className="m-0 text-[2rem] leading-tight">
                  {product.name}
                </DialogTitle>
                <DialogDescription className="text-[0.95rem] leading-relaxed text-foreground">
                  {product.description}
                </DialogDescription>

                <p className="text-[1.5rem] font-bold tabular-nums">
                  {formatPrice(product.price)}
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-3">
                  {out ? (
                    <Button type="button" disabled>
                      Sold out
                    </Button>
                  ) : (
                    <>
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          className="grid size-[38px] place-items-center rounded-full text-[1.1rem] transition-colors hover:bg-muted"
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                        >
                          −
                        </button>
                        <span className="min-w-[30px] text-center text-sm font-semibold tabular-nums">
                          {qty}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          className="grid size-[38px] place-items-center rounded-full text-[1.1rem] transition-colors hover:bg-muted"
                          disabled={qty >= room}
                          onClick={() =>
                            setQty((q) => Math.min(room, q + 1))
                          }
                        >
                          +
                        </button>
                      </div>
                      <Button
                        type="button"
                        disabled={room <= 0}
                        onClick={() => {
                          addItem(product.id, qty);
                          close();
                        }}
                      >
                        {room <= 0
                          ? "All in your cart"
                          : `Add to cart, ${formatPrice(product.price * qty)}`}
                      </Button>
                    </>
                  )}
                </div>

                {!out && product.stock <= 5 ? (
                  <p className="text-[0.88rem] font-semibold text-ring">
                    Only {product.stock} left in stock.
                  </p>
                ) : null}

                {pairs.length > 0 ? (
                  <div className="mt-1.5 border-t border-border pt-4">
                    <h3 className="mb-2.5 font-sans text-[0.92rem] font-bold">
                      Pairs well with
                    </h3>
                    <div className="grid grid-cols-3 gap-2.5">
                      {pairs.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="grid justify-items-center gap-1 rounded-[14px] border border-border bg-background px-2 py-3 text-center text-[0.85rem] leading-tight font-semibold transition-colors hover:border-foreground"
                          onClick={() => openQuickView(p.id)}
                        >
                          <ProductImage
                            imageKey={p.imageUrl}
                            alt=""
                            className="mb-0.5 size-11 rounded-lg object-cover"
                          />
                          <span className="line-clamp-2">{p.name}</span>
                          <span className="text-[0.84rem] font-normal text-muted-foreground">
                            {formatPrice(p.price)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
