import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
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
  const detailTo = `/shoppilot-ai/products/${product.id}`;

  return (
    <Card className="flex flex-col overflow-hidden">
      <Link to={detailTo} className="block aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="size-full object-cover transition-opacity hover:opacity-90"
          loading="lazy"
        />
      </Link>
      <CardHeader className="flex-1">
        <CardTitle className="text-sm">
          <Link to={detailTo} className="hover:underline">
            {product.name}
          </Link>
        </CardTitle>
        <CardDescription>{product.category}</CardDescription>
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
