import ProductCard from "./ProductCard";
import PageShell from "./PageShell";
import { useProductsStore } from "./store/productsStore";

export default function SupportHomePage() {
  const products = useProductsStore((s) => s.products);

  return (
    <PageShell>
      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </PageShell>
  );
}
