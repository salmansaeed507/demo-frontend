import { useEffect } from "react";
import { AUTH_STORE_KEY, useAuthStore } from "./authStore";

/** Mount-time auth side effects: validate persisted session + cross-tab sync. */
export default function AuthBootstrap() {
  useEffect(() => {
    let cancelled = false;

    function runValidate() {
      if (cancelled) return;
      void useAuthStore.getState().validateSession();
    }

    if (useAuthStore.persist.hasHydrated()) {
      runValidate();
    }

    const unsubHydration = useAuthStore.persist.onFinishHydration(runValidate);

    function onStorage(event: StorageEvent) {
      if (event.key !== AUTH_STORE_KEY) return;
      void useAuthStore.persist.rehydrate();
    }
    window.addEventListener("storage", onStorage);

    return () => {
      cancelled = true;
      unsubHydration();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return null;
}
