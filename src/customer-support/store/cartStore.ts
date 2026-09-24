import { create } from "zustand";
import type { Product } from "../mock/products";

export type CartLine = {
  productId: string;
  quantity: number;
};

export type CartLineWithProduct = {
  product: Product;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  addItem: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  lines: [],
  addItem: (productId, quantity = 1) => {
    set((s) => {
      const existing = s.lines.find((l) => l.productId === productId);
      if (existing) {
        return {
          lines: s.lines.map((l) =>
            l.productId === productId
              ? { ...l, quantity: l.quantity + quantity }
              : l,
          ),
        };
      }
      return { lines: [...s.lines, { productId, quantity }] };
    });
  },
  setQuantity: (productId, quantity) => {
    set((s) => {
      if (quantity <= 0) {
        return { lines: s.lines.filter((l) => l.productId !== productId) };
      }
      return {
        lines: s.lines.map((l) =>
          l.productId === productId ? { ...l, quantity } : l,
        ),
      };
    });
  },
  removeItem: (productId) => {
    set((s) => ({
      lines: s.lines.filter((l) => l.productId !== productId),
    }));
  },
  clear: () => set({ lines: [] }),
}));

/** Join cart lines with catalog products (call sites pass both stores). */
export function cartLinesWithProducts(
  lines: CartLine[],
  products: Product[],
): CartLineWithProduct[] {
  return lines
    .map((line) => {
      const product = products.find((p) => p.id === line.productId);
      return product ? { product, quantity: line.quantity } : null;
    })
    .filter((x): x is CartLineWithProduct => x !== null);
}

export function cartSubtotal(lines: CartLineWithProduct[]) {
  return lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
}

export function cartItemCount(lines: CartLine[]) {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}
