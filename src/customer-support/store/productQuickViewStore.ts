import { create } from "zustand";

type ProductQuickViewState = {
  productId: string | null;
  open: (productId: string) => void;
  close: () => void;
};

export const useProductQuickViewStore = create<ProductQuickViewState>(
  (set) => ({
    productId: null,
    open: (productId) => set({ productId }),
    close: () => set({ productId: null }),
  }),
);
