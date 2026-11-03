import { create } from "zustand";
import type { Product } from "../mock/products";
import * as customerSupportApi from "../../api/customerSupport";
import { mapProduct } from "../../api/mappers";
import type { DomainLoadStatus } from "./loadStatus";

type ProductInput = Omit<Product, "id"> & { id?: string };

type ProductsState = {
  products: Product[];
  status: DomainLoadStatus;
  error: string | null;
  setProducts: (products: Product[]) => void;
  getProduct: (id: string) => Product | undefined;
  load: (opts?: { force?: boolean; silent?: boolean }) => Promise<void>;
  createProduct: (input: ProductInput) => Promise<Product>;
  updateProduct: (id: string, patch: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
};

let inflight: Promise<void> | null = null;

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  status: "idle",
  error: null,
  setProducts: (products) => set({ products }),
  getProduct: (id) => get().products.find((p) => p.id === id),
  load: async (opts) => {
    const force = opts?.force ?? false;
    // Silent: refresh in place (no loading state, keep data on error).
    const silent = opts?.silent ?? false;
    const { status } = get();
    if (!force && status === "ready") return;
    if (inflight) return inflight;

    if (!silent) set({ status: "loading", error: null });
    inflight = (async () => {
      try {
        const products = (await customerSupportApi.listProducts()).map(
          mapProduct,
        );
        set({ products, status: "ready", error: null });
      } catch (err) {
        if (!silent) {
          set({
            status: "error",
            error:
              err instanceof Error ? err.message : "Failed to load products",
          });
        }
      } finally {
        inflight = null;
      }
    })();
    return inflight;
  },
  createProduct: async (input) => {
    const created = mapProduct(
      await customerSupportApi.createProduct({
        id: input.id,
        name: input.name,
        price: input.price,
        category: input.category,
        description: input.description,
        stock: input.stock,
        imageUrl: input.imageUrl,
      }),
    );
    set((s) => ({ products: [created, ...s.products], status: "ready" }));
    return created;
  },
  updateProduct: async (id, patch) => {
    const updated = mapProduct(
      await customerSupportApi.updateProduct(id, {
        name: patch.name,
        price: patch.price,
        category: patch.category,
        description: patch.description,
        stock: patch.stock,
        imageUrl: patch.imageUrl,
      }),
    );
    set((s) => ({
      products: s.products.map((p) => (p.id === id ? updated : p)),
    }));
  },
  deleteProduct: async (id) => {
    await customerSupportApi.deleteProduct(id);
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
  },
}));
