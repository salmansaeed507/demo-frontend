import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { MessageCircle, Search, ShoppingCart, Store, ArrowLeft, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartProvider, useCart } from "./CartContext";
import { formatPrice, type Product } from "./mock/products";
import { ShopPilotProvider, useShopPilot } from "./store/ShopPilotStore";
import SupportChatPanel from "./SupportChatPanel";

const SHOPPILOT_TITLE = "ShopPilot AI | E-commerce & AI Support";
const DEFAULT_TITLE = "Demo Hub";

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

function ProductSearch() {
  const navigate = useNavigate();
  const { products } = useShopPilot();
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
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-3 py-2 sm:px-4 sm:py-0">
        <div className="flex h-12 items-center gap-2 sm:h-16 sm:gap-4">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">All Demos</span>
          </Link>

          <NavLink
            to="/shoppilot-ai"
            end
            className="flex min-w-0 shrink items-center gap-2 font-heading text-sm font-semibold tracking-tight text-slate-900 sm:text-base"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-violet-500 text-white sm:size-9">
              <Store className="size-4" />
            </span>
            <span className="truncate">ShopPilot AI</span>
          </NavLink>

          <div className="ml-auto hidden min-w-0 flex-1 md:block">
            <ProductSearch />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 md:ml-0">
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
          </div>
        </div>

        <div className="pb-1 md:hidden">
          <ProductSearch />
        </div>
      </div>
    </header>
  );
}

function FloatingChatButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open AI support chat"
      className="group fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-indigo-600 to-violet-500 py-3 pr-3.5 pl-3 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 sm:right-5 sm:bottom-5 sm:py-3.5 sm:pr-4 sm:pl-3.5"
    >
      <span className="relative flex size-9 items-center justify-center rounded-full bg-white/15">
        <span className="absolute inset-0 animate-ping rounded-full bg-white/20 [animation-duration:2.5s]" />
        <Bot className="relative size-5" />
      </span>
      <span className="hidden pr-1 text-left sm:block">
        <span className="block text-sm font-semibold leading-tight">
          ShopPilot AI
        </span>
        <span className="block text-[11px] font-medium text-white/80 leading-tight">
          Ask support
        </span>
      </span>
      <MessageCircle className="size-4 opacity-80 sm:hidden" />
    </button>
  );
}

function StorefrontShell() {
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);
  const isAdmin = location.pathname.includes("/admin");

  useEffect(() => {
    document.title = isAdmin
      ? "Customer Support Agent | ShopPilot AI"
      : SHOPPILOT_TITLE;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [isAdmin]);

  if (isAdmin) {
    return <Outlet />;
  }

  return (
    <div className="cs-theme flex min-h-svh flex-col overflow-x-hidden bg-zinc-100 text-slate-900">
      <StorefrontHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:py-8">
        <Outlet />
      </main>
      <FloatingChatButton onOpen={() => setChatOpen(true)} />
      <SupportChatPanel open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}

export default function CustomerSupportLayout() {
  return (
    <ShopPilotProvider>
      <CartProvider>
        <StorefrontShell />
      </CartProvider>
    </ShopPilotProvider>
  );
}
