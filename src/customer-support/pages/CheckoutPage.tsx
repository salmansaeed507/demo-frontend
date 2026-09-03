import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <PageShell
        title="Checkout"
        description="Your cart is empty."
        contentClassName="mx-auto max-w-2xl px-4"
      >
        <Card>
          <CardHeader>
            <CardTitle>Nothing to check out</CardTitle>
            <CardDescription>Your cart is empty.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="outline">
              <Link to="/customer-support/products">Browse products</Link>
            </Button>
          </CardFooter>
        </Card>
      </PageShell>
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const orderId = `ORD-${48290 + itemCount}`;
    const total = subtotal;
    clear();
    navigate(
      `/customer-support/order-confirmation?orderId=${encodeURIComponent(orderId)}&total=${total.toFixed(2)}&name=${encodeURIComponent(name)}`,
    );
  }

  return (
    <PageShell
      title="Checkout"
      description="Simulated checkout — no payment is processed."
      contentClassName="mx-auto max-w-4xl px-4"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shipping</CardTitle>
            <CardDescription>
              Demo form — values are not sent to a backend.
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
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
            </CardContent>
            <CardFooter className="gap-2">
              <Button type="submit">Place order</Button>
              <Button asChild variant="ghost">
                <Link to="/customer-support/cart">Back to cart</Link>
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {linesWithProducts.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-3 text-sm">
                <img
                  src={product.imageUrl}
                  alt=""
                  className="size-12 shrink-0 rounded-md object-cover"
                />
                <span className="min-w-0 flex-1">
                  {product.name} × {quantity}
                </span>
                <span className="shrink-0 font-medium">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
