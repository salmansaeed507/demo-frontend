import ProductCard from "./ProductCard";
import PageShell from "./PageShell";
import { products } from "./mock/products";

export default function SupportHomePage() {
  return (
    <PageShell
      title={
        <>
          Shop the store, let{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">
            ShopAssist
          </span>{" "}
          handle support
        </>
      }
      description="An AI agent connected to the knowledge base and order API — answering questions, tracking orders, and creating tickets automatically."
    >
      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </PageShell>
  );
}
