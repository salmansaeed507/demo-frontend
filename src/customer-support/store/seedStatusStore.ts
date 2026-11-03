import { create } from "zustand";
import * as customerSupportApi from "../../api/customerSupport";
import type { ApiSeedStatus } from "../../api/customerSupport";
import { useKnowledgeStore } from "./knowledgeStore";
import { useOrdersStore } from "./ordersStore";
import { useProductsStore } from "./productsStore";
import { useTicketsStore } from "./ticketsStore";

const POLL_MS = 1500;
const ERROR_RETRY_MS = 4000;
// Stop polling if a seed never finishes (e.g. no worker running).
const MAX_WAIT_MS = 3 * 60 * 1000;

type SeedStatusState = {
  /** null until the first check for this session. */
  status: ApiSeedStatus | null;
  watch: () => void;
  stop: () => void;
  retry: () => Promise<void>;
};

let timer: ReturnType<typeof setTimeout> | null = null;
// Each watch() gets a new run id; a stale poll loop sees it changed and exits.
let runId = 0;

/** Re-fetch every store that already loaded (possibly empty) data. */
function reloadLoadedStores() {
  for (const store of [
    useProductsStore,
    useOrdersStore,
    useTicketsStore,
    useKnowledgeStore,
  ]) {
    if (store.getState().status !== "idle") {
      void store.getState().load({ force: true, silent: true });
    }
  }
}

export const useSeedStatusStore = create<SeedStatusState>((set, get) => {
  function schedule(run: number, startedAt: number, delay: number) {
    timer = setTimeout(() => void poll(run, startedAt), delay);
  }

  async function poll(run: number, startedAt: number) {
    let next: ApiSeedStatus;
    try {
      next = (await customerSupportApi.getSeedStatus()).status;
    } catch (err) {
      if (run !== runId) return;
      console.error("Failed to check demo data status", err);
      if (Date.now() - startedAt < MAX_WAIT_MS) {
        schedule(run, startedAt, ERROR_RETRY_MS);
      }
      return;
    }
    if (run !== runId) return;

    const prev = get().status;
    set({ status: next });
    if (next === "pending") {
      if (Date.now() - startedAt < MAX_WAIT_MS) {
        schedule(run, startedAt, POLL_MS);
      }
      return;
    }
    // Also from null: a fast seed can finish before the first poll, after
    // pages already loaded empty lists.
    if (next === "ready" && prev !== "ready") {
      reloadLoadedStores();
    }
  }

  return {
    status: null,
    watch: () => {
      get().stop();
      void poll(runId, Date.now());
    },
    stop: () => {
      runId += 1;
      if (timer) clearTimeout(timer);
      timer = null;
      set({ status: null });
    },
    retry: async () => {
      await customerSupportApi.requestSeed();
      get().watch();
    },
  };
});
