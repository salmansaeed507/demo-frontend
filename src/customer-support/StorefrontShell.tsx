import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProductsStore } from "./store/productsStore";
import StorefrontFloatingChatButton from "./StorefrontFloatingChatButton";
import StorefrontHeader from "./StorefrontHeader";
import SupportChatPanel from "./SupportChatPanel";

const SHOPPILOT_TITLE = "ShopPilot AI | E-commerce & AI Support";
const DEFAULT_TITLE = "Demo Hub";

export default function StorefrontShell() {
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);
  const isAdmin = location.pathname.includes("/admin");
  const status = useProductsStore((s) => s.status);
  const error = useProductsStore((s) => s.error);
  const load = useProductsStore((s) => s.load);

  useEffect(() => {
    document.title = isAdmin
      ? "Customer Support Agent | ShopPilot AI"
      : SHOPPILOT_TITLE;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) void load();
  }, [isAdmin, load]);

  if (isAdmin) {
    return <Outlet />;
  }

  if (status === "idle" || status === "loading") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-zinc-100 text-sm text-slate-500">
        Loading ShopPilot…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-zinc-100 px-4 text-center">
        <p className="max-w-md text-sm text-red-600">{error}</p>
        <Button
          type="button"
          size="sm"
          onClick={() => void load({ force: true })}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="cs-theme flex min-h-svh flex-col overflow-x-hidden bg-zinc-100 text-slate-900">
      <StorefrontHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:py-8">
        <Outlet />
      </main>
      <StorefrontFloatingChatButton onOpen={() => setChatOpen(true)} />
      <SupportChatPanel open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}
