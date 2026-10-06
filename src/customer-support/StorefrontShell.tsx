import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProductsStore } from "./store/productsStore";
import ProductQuickViewDialog from "./ProductQuickViewDialog";
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
      <div className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
        Loading ShopPilot…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <p className="max-w-md text-sm text-destructive">{error}</p>
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
    <div className="flex min-h-svh flex-col overflow-x-hidden bg-background text-foreground">
      <StorefrontHeader />
      <main className="mx-auto flex w-full max-w-[1180px] flex-1 flex-col px-[clamp(16px,4vw,40px)] py-6 sm:py-8">
        <Outlet />
      </main>
      <StorefrontFloatingChatButton onOpen={() => setChatOpen(true)} />
      <SupportChatPanel open={chatOpen} onOpenChange={setChatOpen} />
      <ProductQuickViewDialog />
    </div>
  );
}
