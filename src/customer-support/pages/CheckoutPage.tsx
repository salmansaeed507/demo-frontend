import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import PageShell from "../PageShell";
import { useCart } from "../CartContext";
import { formatPrice } from "../mock/products";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { linesWithProducts, subtotal, clear, itemCount } = useCart();
  const [name, setName] = useState("Alex Rivera");
  const [email, setEmail] = useState("alex@example.com");
  const [address, setAddress] = useState("123 Market St, Austin, TX 78701");

  if (linesWithProducts.length === 0) {
    return (
      <PageShell>
        <div className="flex min-h-[40vh] flex-col justify-center py-8">
          <p className="text-sm font-medium tracking-wide text-indigo-600 uppercase">
            Checkout
          </p>
          <h2 className="font-heading mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Nothing to check out
          </h2>
          <p className="mt-2 max-w-lg text-slate-600">
            Your cart is empty. Add items from the catalog to continue.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link to="/shoppilot-ai">Browse products</Link>
            </Button>
          </div>
        </div>
      </PageShell>
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const orderId = `ORD-${48290 + itemCount}`;
    const total = subtotal;
    clear();
    navigate(
      `/shoppilot-ai/order-confirmation?orderId=${encodeURIComponent(orderId)}&total=${total.toFixed(2)}&name=${encodeURIComponent(name)}`,
    );
  }

  return (
    <PageShell>
      <form
        onSubmit={onSubmit}
        className="grid gap-8 lg:grid-cols-[320px_1fr]"
      >
        <div className="space-y-4 rounded-md border border-zinc-200 bg-white p-5 sm:p-6">
          <div>
            <h3 className="font-heading text-lg font-semibold text-slate-900">
              Shipping
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Demo form — values are not sent to a backend.
            </p>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="address">Shipping address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <aside className="h-fit space-y-4 rounded-md border border-zinc-200 bg-white p-5 lg:sticky lg:top-20">
          <h3 className="font-heading text-lg font-semibold text-slate-900">
            Order summary
          </h3>
          <Separator />
          <div className="space-y-3">
            {linesWithProducts.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-3 text-sm">
                <Link
                  to={`/shoppilot-ai/products/${product.id}`}
                  className="size-12 shrink-0 overflow-hidden rounded-md bg-muted"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="size-full object-cover transition-opacity hover:opacity-90"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/shoppilot-ai/products/${product.id}`}
                    className="line-clamp-2 font-medium text-slate-900 hover:text-indigo-600 hover:underline"
                  >
                    {product.name}
                  </Link>
                  <p className="text-muted-foreground">× {quantity}</p>
                </div>
                <span className="shrink-0 font-medium text-slate-900">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-slate-900">
              {formatPrice(subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium text-slate-900">Free (demo)</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">Total</span>
            <span className="text-xl font-bold text-slate-900">
              {formatPrice(subtotal)}
            </span>
          </div>
          <Button type="submit" className="w-full" size="lg">
            Place order
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/shoppilot-ai/cart">Back to cart</Link>
          </Button>
        </aside>
      </form>
    </PageShell>
  );
}
