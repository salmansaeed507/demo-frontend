import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCart } from "./CartContext";
import { formatPrice, type Product } from "./mock/products";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="-mt-0 aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="size-full object-cover"
          loading="lazy"
        />
      </div>
      <CardHeader className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-sm">{product.name}</CardTitle>
            <CardDescription>{product.category}</CardDescription>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)}
          </span>
        </div>
      </CardHeader>
      <CardFooter className="justify-between gap-2">
        <p className="text-base font-semibold">{formatPrice(product.price)}</p>
        <Button size="sm" onClick={() => addItem(product.id)}>
          <ShoppingCart data-icon="inline-start" />
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  );
}
