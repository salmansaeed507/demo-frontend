import ProductCard from "../ProductCard";
import PageShell from "../PageShell";
import { products } from "../mock/products";

export default function ProductsPage() {
  return (
    <PageShell
      title="Products"
      description="Lightweight demo catalog for the AI support storefront."
    >
      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </PageShell>
  );
}
