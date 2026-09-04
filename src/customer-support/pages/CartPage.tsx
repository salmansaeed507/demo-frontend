import { Link } from "react-router-dom";
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

export default function CartPage() {
  const { linesWithProducts, subtotal, setQuantity, removeItem, itemCount } =
    useCart();

  if (linesWithProducts.length === 0) {
    return (
      <PageShell
        title="Cart"
        description="Your demo cart is empty."
        contentClassName="mx-auto max-w-2xl px-4"
      >
        <Card>
          <CardHeader>
            <CardTitle>Your cart is empty</CardTitle>
            <CardDescription>
              Add items from the catalog to continue the demo checkout flow.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/shoppilot-ai/products">Browse products</Link>
            </Button>
          </CardFooter>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Cart"
      description={`${itemCount} item${itemCount === 1 ? "" : "s"} · static demo cart`}
      contentClassName="mx-auto max-w-2xl px-4"
    >
      <Card>
        <CardContent className="space-y-4 pt-6">
          {linesWithProducts.map(({ product, quantity }, index) => (
            <div key={product.id}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={product.imageUrl}
                    alt=""
                    className="size-14 shrink-0 rounded-md object-cover"
                  />
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(product.price)} each
                    </p>
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor={`qty-${product.id}`}>Qty</Label>
                    <Input
                      id={`qty-${product.id}`}
                      type="number"
                      min={1}
                      className="w-20"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(product.id, Number(e.target.value) || 0)
                      }
                    />
                  </div>
                  <p className="min-w-20 pb-2 text-right font-medium">
                    {formatPrice(product.price * quantity)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(product.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Subtotal</p>
            <p className="text-lg font-medium">{formatPrice(subtotal)}</p>
          </div>
          <Button asChild>
            <Link to="/shoppilot-ai/checkout">Checkout</Link>
          </Button>
        </CardFooter>
      </Card>
    </PageShell>
  );
}
