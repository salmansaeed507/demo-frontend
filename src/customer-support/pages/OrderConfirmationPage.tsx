import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PageShell from "../PageShell";
import { formatPrice } from "../mock/products";

export default function OrderConfirmationPage() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId") ?? "ORD-48291";
  const name = params.get("name") ?? "Customer";
  const totalRaw = params.get("total");
  const total = totalRaw ? Number(totalRaw) : 0;

  return (
    <PageShell>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6 rounded-md border border-zinc-200 bg-white p-5 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="min-w-0">
              <Badge variant="secondary" className="w-fit">
                Order placed
              </Badge>
              <h2 className="font-heading mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Thanks, {name}
              </h2>
              <p className="mt-2 max-w-xl text-slate-600">
                Your demo order is confirmed. Use order{" "}
                <span className="font-medium text-slate-900">{orderId}</span> in
                support chat to try the order-status scenario.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-medium text-slate-900">{orderId}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium text-slate-900">
                {total > 0 ? formatPrice(total) : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-slate-900">Processing</span>
            </div>
          </div>
        </div>

        <aside className="h-fit space-y-4 rounded-md border border-zinc-200 bg-white p-5 lg:sticky lg:top-20">
          <h3 className="font-heading text-lg font-semibold text-slate-900">
            Next steps
          </h3>
          <Separator />
          <p className="text-sm text-muted-foreground">
            Ask ShopPilot AI about this order, or keep shopping the demo catalog.
          </p>
          <Button asChild className="w-full" size="lg">
            <Link to="/shoppilot-ai">
              <MessageCircle data-icon="inline-start" />
              Ask support about this order
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/shoppilot-ai">Continue shopping</Link>
          </Button>
        </aside>
      </div>
    </PageShell>
  );
}
