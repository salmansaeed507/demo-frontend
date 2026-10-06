import { cn } from "@/lib/utils";

export function priorityClass(p: string) {
  if (p === "high")
    return "bg-destructive/18 text-destructive border-destructive/25";
  if (p === "medium") return "bg-ring/20 text-ring border-ring/30";
  return "bg-muted text-muted-foreground border-border";
}

export function statusClass(s: string) {
  if (
    s === "open" ||
    s === "processing" ||
    s === "out_for_delivery" ||
    s === "active"
  )
    return "bg-info/18 text-info border-info/25";
  if (s === "pending") return "bg-ring/20 text-ring border-ring/30";
  if (s === "resolved" || s === "delivered" || s === "indexed")
    return "bg-ok/18 text-ok border-ok/25";
  if (s === "refunded" || s === "cancelled")
    return "bg-muted text-muted-foreground border-border";
  return "bg-muted text-muted-foreground border-border";
}

export function fieldClass() {
  return cn(
    "flex h-auto w-full rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm shadow-none outline-none",
    "placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring",
  );
}
