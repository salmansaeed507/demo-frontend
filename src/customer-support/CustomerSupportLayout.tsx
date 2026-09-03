import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutGrid, MessageCircle, Search, ShoppingCart, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartProvider, useCart } from "./CartContext";
import SupportChatPanel from "./SupportChatPanel";

function StorefrontHeader() {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white text-slate-900">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-4">
        <NavLink
          to="/customer-support"
          end
          className="flex shrink-0 items-center gap-2 font-heading text-base font-semibold tracking-tight text-slate-900"
        >
          <span className="flex size-9 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-violet-500 text-white">
            <Store className="size-4" />
          </span>
          ShopAssist
        </NavLink>

        <div className="relative mx-auto hidden min-w-0 flex-1 max-w-xl md:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-9"
            aria-label="Search products"
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link to="/customer-support/cart" aria-label="Cart">
              <ShoppingCart />
              {itemCount > 0 ? (
                <Badge className="absolute -top-1 -right-1">
                  {itemCount}
                </Badge>
              ) : null}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/customer-support/admin">
              <LayoutGrid data-icon="inline-start" />
              Admin
            </Link>
          </Button>
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

  return (
    <div className="cs-theme flex min-h-svh flex-col overflow-x-hidden bg-zinc-100 text-slate-900">
      <StorefrontHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
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
