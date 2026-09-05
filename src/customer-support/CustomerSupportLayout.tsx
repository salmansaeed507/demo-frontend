import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, MessageCircle, Search, ShoppingCart, Store, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartProvider, useCart } from "./CartContext";
import { formatPrice, products, type Product } from "./mock/products";
import SupportChatPanel from "./SupportChatPanel";

const SHOPPILOT_TITLE = "ShopPilot AI | E-commerce & AI Support";
const DEFAULT_TITLE = "Demo Hub";

function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q),
  );
}

function ProductSearch() {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => searchProducts(query), [query]);
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
    <div ref={rootRef} className="relative mx-auto hidden min-w-0 flex-1 max-w-xl md:block">
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
                    <img
                      src={product.imageUrl}
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

function StorefrontHeader() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white text-slate-900">
      <div className="relative">
        <Link
          to="/"
          className="absolute top-0 left-0 z-10 flex h-16 items-center gap-1.5 px-4 text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600 sm:px-5"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">All Demos</span>
          <span className="sm:hidden">Demos</span>
        </Link>

        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-4">
          <NavLink
            to="/shoppilot-ai"
            end
            className="flex shrink-0 items-center gap-2 font-heading text-base font-semibold tracking-tight text-slate-900"
          >
            <span className="flex size-9 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-violet-500 text-white">
              <Store className="size-4" />
            </span>
            ShopPilot AI
          </NavLink>

          <ProductSearch />

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <Button asChild variant="ghost" size="icon" className="relative">
              <Link to="/shoppilot-ai/cart" aria-label="Cart">
                <ShoppingCart />
                {itemCount > 0 ? (
                  <Badge className="absolute -top-1 -right-1 size-5 justify-center rounded-full border-0 bg-indigo-600 px-0 text-[10px] text-white shadow-none hover:bg-indigo-600">
                    {itemCount}
                  </Badge>
                ) : null}
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/shoppilot-ai/admin">
                <LayoutGrid data-icon="inline-start" />
                Admin
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function FloatingChatButton({ onOpen }: { onOpen: () => void }) {
  return (
    <Button
      type="button"
      size="icon"
      className="fixed right-5 bottom-5 z-40"
      onClick={onOpen}
      aria-label="Open AI support chat"
    >
      <MessageCircle />
    </Button>
  );
}

function StorefrontShell() {
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);
  const isAdmin = location.pathname.includes("/admin");

  useEffect(() => {
    document.title = SHOPPILOT_TITLE;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, []);

  return (
    <div className="cs-theme flex min-h-svh flex-col overflow-x-hidden bg-zinc-100 text-slate-900">
      <StorefrontHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:py-8">
        <Outlet />
      </main>
      {!isAdmin ? (
        <>
          <FloatingChatButton onOpen={() => setChatOpen(true)} />
          <SupportChatPanel open={chatOpen} onOpenChange={setChatOpen} />
        </>
      ) : null}
    </div>
  );
}

export default function CustomerSupportLayout() {
  return (
    <CartProvider>
      <StorefrontShell />
    </CartProvider>
  );
}
