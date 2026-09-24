import { useProductsStore } from "./productsStore";
import { useOrdersStore } from "./ordersStore";
import { useTicketsStore } from "./ticketsStore";
import { useKnowledgeStore } from "./knowledgeStore";
import { useChatStore } from "./chatStore";

/**
 * User-initiated refresh: force-reload only domains that were already visited
 * (status !== idle), so admin does not fetch everything up front.
 */
export async function reloadVisitedDomains() {
  const tasks: Promise<void>[] = [];
  if (useProductsStore.getState().status !== "idle") {
    tasks.push(useProductsStore.getState().load({ force: true }));
  }
  if (useOrdersStore.getState().status !== "idle") {
    tasks.push(useOrdersStore.getState().load({ force: true }));
  }
  if (useTicketsStore.getState().status !== "idle") {
    tasks.push(useTicketsStore.getState().load({ force: true }));
  }
  if (useKnowledgeStore.getState().status !== "idle") {
    tasks.push(useKnowledgeStore.getState().load({ force: true }));
  }
  if (useChatStore.getState().status !== "idle") {
    tasks.push(useChatStore.getState().load({ force: true }));
  }
  await Promise.all(tasks);
}
