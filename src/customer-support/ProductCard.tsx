import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProductImage from "./ProductImage";
import { useCartStore } from "./store/cartStore";
import { useProductQuickViewStore } from "./store/productQuickViewStore";
import { formatPrice, type Product } from "./mock/products";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const openQuickView = useProductQuickViewStore((s) => s.open);

  return (
    <Card className="group flex flex-col overflow-hidden transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(24,24,27,0.12)]">
      <button
        type="button"
        className="relative block aspect-[4/3] overflow-hidden bg-muted text-left"
        onClick={() => openQuickView(product.id)}
        aria-label={`Quick view ${product.name}`}
      >
        <ProductImage
          imageKey={product.imageUrl}
          alt={product.name}
          className="size-full object-cover transition-transform duration-250 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-1.5 rounded-full bg-card px-3.5 py-1 text-[0.84rem] font-semibold opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
          Quick view
        </span>
      </button>
      <CardHeader className="flex-1 gap-1.5 pt-4">
        <CardDescription className="text-[0.88rem]">
          {product.category}
        </CardDescription>
        <CardTitle className="text-[1.3rem]">
          <button
            type="button"
            className="text-left hover:underline"
            onClick={() => openQuickView(product.id)}
          >
            {product.name}
          </button>
        </CardTitle>
      </CardHeader>
      <CardFooter className="justify-between gap-2 pt-3.5">
        <p className="text-[1.1rem] font-bold">{formatPrice(product.price)}</p>
        <Button size="sm" onClick={() => addItem(product.id)}>
          <ShoppingCart data-icon="inline-start" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
