import { Link, useParams } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCart } from "../CartContext";
import PageShell from "../PageShell";
import { formatPrice, getProduct } from "../mock/products";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const product = id ? getProduct(id) : undefined;
  const { addItem } = useCart();

  if (!product) {
    return (
      <PageShell contentClassName="mx-auto max-w-lg px-4">
        <Card>
          <CardHeader>
            <CardTitle>Product not found</CardTitle>
            <CardDescription>
              That item is not in the demo catalog.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/shoppilot-ai">Back to store</Link>
            </Button>
          </CardFooter>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell contentClassName="mx-auto max-w-4xl px-4">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-[4/3] overflow-hidden rounded-md bg-muted">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="size-full object-cover"
          />
        </div>

        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <Badge variant="secondary" className="w-fit">
              {product.category}
            </Badge>
            <CardTitle className="text-2xl">{product.name}</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              {product.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 px-0">
            <p className="text-2xl font-semibold">{formatPrice(product.price)}</p>
            <p className="text-sm text-muted-foreground">
              {product.stock > 0
                ? `${product.stock} in stock`
                : "Out of stock"}
            </p>
          </CardContent>
          <CardFooter className="gap-2 px-0">
            <Button onClick={() => addItem(product.id)}>
              <ShoppingCart data-icon="inline-start" />
              Add to cart
            </Button>
            <Button asChild variant="outline">
              <Link to="/shoppilot-ai">Back to store</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageShell>
  );
}
