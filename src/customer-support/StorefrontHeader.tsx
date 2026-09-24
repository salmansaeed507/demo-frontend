import { Link, NavLink } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cartItemCount, useCartStore } from "./store/cartStore";
import StorefrontProductSearch from "./StorefrontProductSearch";

export default function StorefrontHeader() {
  const lines = useCartStore((s) => s.lines);
  const itemCount = cartItemCount(lines);

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
            <StorefrontProductSearch />
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
          <StorefrontProductSearch />
        </div>
      </div>
    </header>
  );
}
