export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  imageUrl: string;
};

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
