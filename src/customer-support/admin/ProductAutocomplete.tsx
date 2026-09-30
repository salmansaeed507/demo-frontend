import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, type Product } from "../mock/products";
import ProductImage from "../ProductImage";
import { useProductsStore } from "../store/productsStore";
import { fieldClass } from "./styles";

function searchProducts(list: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return list.slice(0, 8);
  return list
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    )
    .slice(0, 8);
}

type Props = {
  value?: string;
  onSelect: (product: Product) => void;
  excludeIds?: string[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export default function ProductAutocomplete({
  value = "",
  onSelect,
  excludeIds = [],
  disabled = false,
  placeholder = "Search products...",
  className,
}: Props) {
  const products = useProductsStore((s) => s.products);
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const available = useMemo(
    () => products.filter((p) => !excludeIds.includes(p.id)),
    [products, excludeIds],
  );

  const results = useMemo(
    () => searchProducts(available, query),
    [available, query],
  );
  const showPanel = open && !disabled;

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function selectProduct(product: Product) {
    setQuery(product.name);
    setOpen(false);
    onSelect(product);
  }

  return (
    <div ref={rootRef} className={cn("relative z-20 min-w-0", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 z-10 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        value={query}
        disabled={disabled}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={cn(fieldClass(), "pl-8")}
        aria-label="Search products"
        aria-autocomplete="list"
        aria-expanded={showPanel}
        autoComplete="off"
      />
      {showPanel ? (
        <div
          role="listbox"
          className="absolute top-full right-0 left-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-md border border-zinc-200 bg-white shadow-md"
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
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectProduct(product);
                    }}
                  >
                    <ProductImage
                      imageKey={product.imageUrl}
                      alt=""
                      className="size-9 shrink-0 rounded object-cover"
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
