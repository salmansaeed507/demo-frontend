import { Link, NavLink } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cartItemCount, useCartStore } from "./store/cartStore";
import StorefrontProductSearch from "./StorefrontProductSearch";

export default function StorefrontHeader() {
  const lines = useCartStore((s) => s.lines);
  const itemCount = cartItemCount(lines);

  return (
    <>
      <div className="bg-primary text-primary-foreground">
        <div className="relative mx-auto flex max-w-[1180px] items-center justify-center px-[clamp(16px,4vw,40px)] py-2 text-[0.88rem]">
          <span>
            Free shipping on demo orders. Packed to order — ask Gadget Grove for
            help anytime.
          </span>
          <Link
            to="/gadget-grove/admin"
            className="absolute right-[clamp(16px,4vw,40px)] top-1/2 hidden -translate-y-1/2 text-[0.85rem] text-inherit underline opacity-85 sm:inline"
          >
            Open admin
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-[color-mix(in_srgb,var(--background)_90%,transparent)] text-foreground backdrop-blur-[10px]">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-2 px-[clamp(16px,4vw,40px)] py-3 sm:flex-row sm:items-center sm:gap-7">
          <div className="flex items-center gap-3">
            <NavLink
              to="/gadget-grove"
              end
              className="font-heading text-[1.7rem] tracking-[-0.02em] text-foreground sm:text-[1.9rem]"
            >
              Gadget Grove
            </NavLink>
          </div>

          <div className="hidden min-w-0 flex-1 md:block">
            <StorefrontProductSearch />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Button
              asChild
              variant="ghost"
              className="h-auto gap-2.5 rounded-full border-foreground px-[18px] py-2 pl-3.5 font-semibold"
            >
              <Link to="/gadget-grove/cart" aria-label="Open cart">
                <ShoppingCart className="size-5" />
                Cart
                <b className="inline-grid min-w-[22px] place-items-center rounded-[11px] bg-foreground px-1.5 text-[0.8rem] font-semibold text-background">
                  {itemCount}
                </b>
              </Link>
            </Button>
          </div>

          <div className="md:hidden">
            <StorefrontProductSearch />
          </div>
        </div>
      </header>
    </>
  );
}
