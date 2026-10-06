import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  BookOpen,
  MessageSquare,
  Package,
  ShoppingBag,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AgentChatPanel from "./admin/AgentChatPanel";

const tabs = [
  {
    to: "knowledge",
    label: "RAG / Knowledge",
    short: "RAG",
    icon: BookOpen,
  },
  { to: "tickets", label: "Tickets", short: "Tickets", icon: Ticket },
  { to: "orders", label: "Orders", short: "Orders", icon: Package },
  { to: "products", label: "Products", short: "Products", icon: ShoppingBag },
] as const;

type MobilePane = "manage" | "chat";

export default function AdminLayout() {
  const [mobilePane, setMobilePane] = useState<MobilePane>("manage");
  const [chatOpen, setChatOpen] = useState(false);

  function openChat() {
    setChatOpen(true);
    setMobilePane("chat");
  }

  function closeChat() {
    setChatOpen(false);
    setMobilePane("manage");
  }

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background text-foreground">
      <header className="sticky top-0 z-20 bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-6 gap-y-2 px-[clamp(16px,4vw,40px)] py-2.5 sm:h-[62px] sm:flex-nowrap sm:py-0">
          <Link
            to="/shoppilot-ai/admin"
            className="font-heading mr-auto flex items-center gap-2.5 text-[1.45rem] text-inherit sm:mr-0"
          >
            ShopPilot
            <span className="rounded-full bg-white/14 px-2.5 py-0.5 font-sans text-[0.75rem] font-semibold">
              Admin
            </span>
          </Link>

          <nav
            className="order-3 flex h-[46px] w-full gap-0.5 overflow-x-auto sm:order-0 sm:mr-auto sm:h-full sm:w-auto"
            role="tablist"
            aria-label="Admin sections"
          >
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                role="tab"
                className={({ isActive }) =>
                  cn(
                    "relative inline-flex shrink-0 items-center gap-2 px-[15px] text-sm font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "text-sidebar-foreground after:absolute after:right-3 after:bottom-0 after:left-3 after:h-[3px] after:rounded-t-[3px] after:bg-gold"
                      : "text-sidebar-foreground/65 hover:text-sidebar-foreground",
                  )
                }
              >
                <tab.icon className="size-4 shrink-0 opacity-80" />
                <span className="sm:hidden">{tab.short}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="border-white/28 text-sidebar-foreground hover:border-sidebar-foreground"
            >
              <Link to="/">All demos</Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="border-white/28 text-sidebar-foreground hover:border-sidebar-foreground"
            >
              <Link to="/shoppilot-ai">View store</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
        <section
          className={cn(
            "min-h-0 min-w-0 flex-1 flex-col",
            mobilePane === "chat" ? "max-md:hidden" : "flex",
            "md:flex",
          )}
        >
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain bg-background p-3 sm:p-5">
            <div className="mx-auto max-w-[1180px]">
              {!chatOpen ? (
                <button
                  type="button"
                  onClick={openChat}
                  className="relative mb-3 flex w-full items-center gap-3.5 overflow-hidden rounded-[16px] border border-border bg-[color-mix(in_srgb,var(--tint)_34%,var(--card))] px-3.5 py-3 text-left transition hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:gap-4 sm:px-4"
                >
                  <span
                    className="pointer-events-none absolute -top-6 -right-4 size-20 rounded-full bg-gold/25 blur-xl"
                    aria-hidden
                  />
                  <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <MessageSquare className="size-4" />
                    <span className="absolute -top-0.5 -right-0.5 flex size-2.5">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-70" />
                      <span className="relative inline-flex size-2.5 rounded-full bg-gold ring-2 ring-primary" />
                    </span>
                  </span>
                  <span className="relative min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="font-heading text-[1.15rem] leading-none tracking-tight text-foreground sm:text-[1.25rem]">
                        Test your agent live here
                      </span>
                      <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[0.68rem] font-bold tracking-[0.06em] text-primary-foreground uppercase">
                        Live
                      </span>
                    </span>
                    <span className="mt-1 block truncate text-[0.82rem] text-foreground/70">
                      Try orders, knowledge, or tickets in real time.
                    </span>
                  </span>
                  <span className="relative hidden shrink-0 rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground sm:inline-flex">
                    Open chat
                  </span>
                  <span className="relative shrink-0 text-lg font-semibold text-foreground/65 sm:hidden">
                    →
                  </span>
                </button>
              ) : null}
              <Outlet />
            </div>
          </div>
        </section>

        {chatOpen ? (
          <div
            className={cn(
              "flex min-h-0 w-full min-w-0 flex-1 flex-col bg-card md:absolute md:inset-y-0 md:right-0 md:z-30 md:w-[min(720px,72vw)] md:flex-none md:border-l md:border-border md:shadow-[-12px_0_40px_rgba(24,24,27,0.12)]",
              mobilePane === "manage" && "max-md:hidden",
            )}
          >
            <AgentChatPanel
              onMobileBack={closeChat}
              onClose={closeChat}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
