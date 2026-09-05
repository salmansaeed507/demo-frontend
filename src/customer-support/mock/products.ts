export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  imageUrl: string;
};

export const products: Product[] = [
  {
    id: "p-1001",
    name: "Aurora Wireless Headphones",
    price: 129.99,
    category: "Audio",
    description:
      "Over-ear headphones with active noise canceling, 30-hour battery, and USB-C charging.",
    stock: 24,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "p-1002",
    name: "Nimbus Desk Lamp",
    price: 49.0,
    category: "Home",
    description:
      "Adjustable color temperature and brightness with memory presets. USB-powered.",
    stock: 18,
    imageUrl:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "p-1003",
    name: "TrailForge Backpack",
    price: 89.0,
    category: "Bags",
    description:
      "Water-resistant 20L backpack with laptop sleeve and hidden passport pocket.",
    stock: 41,
    imageUrl:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "p-1004",
    name: "FrostBottle Steel",
    price: 32.0,
    category: "Drinkware",
    description:
      "24oz double-wall bottle keeps drinks cold for 24 hours or hot for 12.",
    stock: 60,
    imageUrl:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "p-1005",
    name: "Pulse Wireless Mouse",
    price: 39.99,
    category: "Accessories",
    description:
      "Quiet-click mouse with multi-device pairing and rechargeable battery.",
    stock: 33,
    imageUrl:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "p-1006",
    name: "SoftCotton Tee Pack",
    price: 45.0,
    category: "Apparel",
    description:
      "Soft unisex tees in charcoal, cream, and navy. Pre-shrunk fabric.",
    stock: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
