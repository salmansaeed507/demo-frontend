import { create } from "zustand";
import type { Order } from "./types";
import * as customerSupportApi from "../../api/customerSupport";
import { mapOrder, toApiOrderItems } from "../../api/mappers";
import { useProductsStore } from "./productsStore";
import type { DomainLoadStatus } from "./loadStatus";

type OrderInput = Omit<Order, "id"> & { id?: string };

type OrdersState = {
  orders: Order[];
  status: DomainLoadStatus;
  error: string | null;
  setOrders: (orders: Order[]) => void;
  load: (opts?: { force?: boolean }) => Promise<void>;
  createOrder: (input: OrderInput) => Promise<Order>;
  updateOrder: (id: string, patch: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  checkoutOrder: (input: {
    customer: string;
    email: string;
    shippingAddress: string;
    phone?: string;
    paymentMethod?: string;
    shippingMethod?: string;
    items: Array<{ productId: string; quantity: number }>;
  }) => Promise<Order>;
};

let inflight: Promise<void> | null = null;

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  status: "idle",
  error: null,
  setOrders: (orders) => set({ orders }),
  load: async (opts) => {
    const force = opts?.force ?? false;
    const { status } = useOrdersStore.getState();
    if (!force && status === "ready") return;
    if (inflight) return inflight;

    set({ status: "loading", error: null });
    inflight = (async () => {
      try {
        const orders = (await customerSupportApi.listOrders()).map(mapOrder);
        set({ orders, status: "ready", error: null });
      } catch (err) {
        set({
          status: "error",
          error: err instanceof Error ? err.message : "Failed to load orders",
        });
      } finally {
        inflight = null;
      }
    })();
    return inflight;
  },
  createOrder: async (input) => {
    const created = mapOrder(
      await customerSupportApi.createOrder({
        id: input.id,
        customer: input.customer,
        email: input.email,
        phone: input.phone,
        shippingAddress: input.shippingAddress,
        items: toApiOrderItems(input.items),
        total: input.total,
        status: input.status,
        shippingMethod: input.shippingMethod,
        carrier: input.carrier,
        trackingNumber: input.trackingNumber,
        paymentMethod: input.paymentMethod,
        placedAt: input.placedAt,
      }),
    );
    set((s) => ({ orders: [created, ...s.orders], status: "ready" }));
    return created;
  },
  updateOrder: async (id, patch) => {
    const body: Record<string, unknown> = {
      customer: patch.customer,
      email: patch.email,
      phone: patch.phone,
      shippingAddress: patch.shippingAddress,
      total: patch.total,
      status: patch.status,
      shippingMethod: patch.shippingMethod,
      carrier: patch.carrier,
      trackingNumber: patch.trackingNumber,
      paymentMethod: patch.paymentMethod,
      placedAt: patch.placedAt,
    };
    if (patch.items !== undefined) {
      body.items = toApiOrderItems(patch.items);
    }
    const updated = mapOrder(await customerSupportApi.updateOrder(id, body));
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? updated : o)),
    }));
  },
  deleteOrder: async (id) => {
    await customerSupportApi.deleteOrder(id);
    set((s) => ({ orders: s.orders.filter((o) => o.id !== id) }));
  },
  checkoutOrder: async (input) => {
    const created = mapOrder(
      await customerSupportApi.checkout({
        customer: input.customer,
        email: input.email,
        shippingAddress: input.shippingAddress,
        phone: input.phone ?? "",
        paymentMethod: input.paymentMethod ?? "Card",
        shippingMethod: input.shippingMethod ?? "Standard",
        items: input.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      }),
    );
    set((s) => ({ orders: [created, ...s.orders] }));
    await useProductsStore.getState().load({ force: true });
    return created;
  },
}));
