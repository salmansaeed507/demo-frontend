import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  MessageSquare,
  Package,
  RotateCcw,
  ShoppingBag,
  Store,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useShopPilot } from "./store/ShopPilotStore";
import AgentChatPanel from "./admin/AgentChatPanel";
import OrdersPanel from "./admin/OrdersPanel";
import ProductsPanel from "./admin/ProductsPanel";
import RagPanel from "./admin/RagPanel";
import TicketsPanel from "./admin/TicketsPanel";

const tabs = [
  { id: "rag", label: "RAG / Knowledge", short: "RAG", icon: BookOpen },
  { id: "tickets", label: "Tickets", short: "Tickets", icon: Ticket },
  { id: "orders", label: "Orders", short: "Orders", icon: Package },
  { id: "products", label: "Products", short: "Products", icon: ShoppingBag },
] as const;

type TabId = (typeof tabs)[number]["id"];
type MobilePane = "manage" | "chat";

export default function AdminLayout() {
  const [active, setActive] = useState<TabId>("rag");
  const [mobilePane, setMobilePane] = useState<MobilePane>("manage");
  const { resetDemoData } = useShopPilot();

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-zinc-100 text-slate-900">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-white/10 bg-[#161822] px-3 sm:h-14 sm:px-5">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">All Demos</span>
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#0f766e] text-white sm:size-8">
            <Store className="size-3.5 sm:size-4" />
          </span>
          <h1 className="truncate text-sm font-semibold tracking-tight text-white sm:text-base">
            Customer Support Agent
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button
            asChild
            size="sm"
            className="bg-white px-2.5 font-semibold text-slate-900 shadow-sm hover:bg-teal-50 hover:text-teal-800 sm:px-3"
          >
            <Link to="/shoppilot-ai">
              <Store className="size-4" />
              <span className="ml-1.5">Storefront</span>
            </Link>
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="px-2 text-slate-400 hover:bg-white/10 hover:text-white sm:px-3"
            onClick={() => {
              if (confirm("Reset all demo data to defaults?")) resetDemoData();
            }}
          >
            <RotateCcw className="size-4" />
            <span className="ml-1.5 hidden sm:inline">Reset data</span>
          </Button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Manage */}
        <section
          className={cn(
            "min-h-0 min-w-0 flex-col border-zinc-200 bg-zinc-50 md:flex md:flex-[1.15] md:flex-row md:border-r",
            mobilePane === "manage" ? "flex flex-1" : "hidden",
          )}
        >
          <nav
            className="flex shrink-0 gap-1 overflow-x-auto border-b border-zinc-200 bg-white p-2 md:w-52 md:flex-col md:gap-0.5 md:overflow-visible md:border-r md:border-b-0 md:p-3"
            role="tablist"
            aria-orientation="vertical"
          >
            <p className="mb-1 hidden px-2 text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase md:block">
              Workspace
            </p>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active === tab.id}
                onClick={() => setActive(tab.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition md:w-full md:gap-2.5 md:py-2.5",
                  active === tab.id
                    ? "bg-teal-900/[0.08] text-teal-900 ring-1 ring-teal-800/15"
                    : "text-slate-500 hover:bg-zinc-50 hover:text-slate-800",
                )}
              >
                <tab.icon className="size-4 shrink-0" />
                <span className="whitespace-nowrap leading-snug md:hidden">
                  {tab.short}
                </span>
                <span className="hidden leading-snug md:inline">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain bg-[#f7f8f9] p-3 pb-28 sm:p-5 md:pb-5">
            {active === "rag" ? <RagPanel /> : null}
            {active === "tickets" ? <TicketsPanel /> : null}
            {active === "orders" ? <OrdersPanel /> : null}
            {active === "products" ? <ProductsPanel /> : null}
          </div>

          {/* Mobile: open chat CTA */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
            <button
              type="button"
              onClick={() => setMobilePane("chat")}
              className="flex w-full items-center gap-3 rounded-2xl bg-[#0f766e] px-4 py-3.5 text-left text-white shadow-lg shadow-teal-900/25 ring-1 ring-white/15 transition active:scale-[0.99]"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15">
                <MessageSquare className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-snug">
                  Hey — chat with the agent here
                </span>
                <span className="mt-0.5 block text-xs text-white/80">
                  Tap to open the support chat
                </span>
              </span>
              <span className="shrink-0 text-lg font-semibold text-white/90">
                →
              </span>
            </button>
          </div>
        </section>

        {/* Chat */}
        <div
          className={cn(
            "min-h-0 min-w-0 flex-1 flex-col md:flex",
            mobilePane === "chat" ? "flex" : "hidden",
          )}
        >
          <AgentChatPanel onMobileBack={() => setMobilePane("manage")} />
        </div>
      </div>
    </div>
  );
}
