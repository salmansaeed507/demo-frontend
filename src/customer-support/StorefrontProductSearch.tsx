import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatPrice, type Product } from "./mock/products";
import ProductImage from "./ProductImage";
import { useProductsStore } from "./store/productsStore";

function searchProducts(list: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return list.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q),
  );
}

export default function StorefrontProductSearch() {
  const navigate = useNavigate();
  const products = useProductsStore((s) => s.products);
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(
    () => searchProducts(products, query),
    [products, query],
  );
  const showPanel = open && query.trim().length > 0;

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function selectProduct(productId: string) {
    setOpen(false);
    setQuery("");
    navigate(`/shoppilot-ai/products/${productId}`);
  }

  return (
    <div ref={rootRef} className="relative mx-auto min-w-0 flex-1 max-w-xl">
      <Search className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search products..."
        className="pl-9"
        aria-label="Search products"
        aria-autocomplete="list"
        aria-expanded={showPanel}
        autoComplete="off"
      />
      {showPanel ? (
        <div
          role="listbox"
          className="absolute top-full right-0 left-0 z-50 mt-1 max-h-80 overflow-y-auto rounded-md border border-zinc-200 bg-white shadow-md"
        >
          {results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              No products found
            </p>
          ) : (
            <ul className="py-1">
              {results.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    role="option"
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-zinc-50"
                    onClick={() => selectProduct(product.id)}
                  >
                    <ProductImage
                      imageKey={product.imageUrl}
                      alt=""
                      className="size-10 shrink-0 rounded object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900">
                        {product.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {product.category}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-slate-900">
                      {formatPrice(product.price)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
