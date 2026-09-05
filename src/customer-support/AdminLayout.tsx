import { NavLink, Outlet } from "react-router-dom";
import {
  BookOpen,
  Bot,
  LayoutGrid,
  MessageSquare,
  Ticket,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import PageShell from "./PageShell";
import { analytics, knowledgeDocs } from "./mock/admin";

const tabs = [
  {
    to: "/shoppilot-ai/admin/tickets",
    label: "Tickets",
    icon: Ticket,
    end: true,
  },
  {
    to: "/shoppilot-ai/admin/conversations",
    label: "Conversations",
    icon: MessageSquare,
  },
  {
    to: "/shoppilot-ai/admin/knowledge-base",
    label: "Knowledge Base",
    icon: BookOpen,
  },
  {
    to: "/shoppilot-ai/admin/analytics",
    label: "Analytics",
    icon: LayoutGrid,
  },
] as const;

const metrics = [
  {
    label: "Conversations today",
    value: String(analytics.conversationsToday),
    trend: analytics.conversationsTrend,
    trendUp: true,
    icon: MessageSquare,
  },
  {
    label: "Resolved by AI",
    value: `${analytics.aiResolvedRate}%`,
    trend: analytics.aiResolvedTrend,
    trendUp: true,
    icon: Bot,
  },
  {
    label: "Open tickets",
    value: String(analytics.openTickets),
    trend: analytics.openTicketsTrend,
    trendUp: false,
    icon: Ticket,
  },
  {
    label: "KB documents",
    value: String(knowledgeDocs.length || analytics.kbDocuments),
    trend: `${analytics.kbChunks} chunks`,
    trendUp: true,
    icon: BookOpen,
  },
] as const;

export default function AdminLayout() {
  return (
    <PageShell>
      <div className="space-y-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <Card key={m.label}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                <m.icon className="size-4 text-muted-foreground" />
                <Badge variant="secondary">
                  {m.trendUp ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  {m.trend}
                </Badge>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl">{m.value}</CardTitle>
                <CardDescription>{m.label}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <nav className="flex flex-wrap gap-1" aria-label="Admin sections">
          {tabs.map((tab) => (
            <Button key={tab.to} asChild variant="ghost" size="sm">
              <NavLink
                to={tab.to}
                end={"end" in tab ? tab.end : false}
                className={({ isActive }) =>
                  cn(isActive && "bg-accent text-accent-foreground")
                }
              >
                <tab.icon className="size-4" />
                {tab.label}
              </NavLink>
            </Button>
          ))}
        </nav>

        <Outlet />
      </div>
    </PageShell>
  );
}
