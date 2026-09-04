import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PageShell from "../PageShell";
import { formatPrice } from "../mock/products";

export default function OrderConfirmationPage() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId") ?? "ORD-48291";
  const name = params.get("name") ?? "Customer";
  const totalRaw = params.get("total");
  const total = totalRaw ? Number(totalRaw) : 0;

  return (
    <PageShell
      title="Order confirmed"
      description="Simulated confirmation for the demo storefront."
      contentClassName="mx-auto max-w-lg px-4"
    >
      <Card>
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            Order placed
          </Badge>
          <CardTitle>Thanks, {name}</CardTitle>
          <CardDescription>
            Use order{" "}
            <span className="font-medium text-foreground">{orderId}</span> in
            support chat to try the order-status scenario.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-medium">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-medium">
              {total > 0 ? formatPrice(total) : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium">Processing</span>
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button asChild>
            <Link to="/shoppilot-ai/chat">Ask support about this order</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/shoppilot-ai/products">Continue shopping</Link>
          </Button>
        </CardFooter>
      </Card>
    </PageShell>
  );
}
