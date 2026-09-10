import { cn } from "@/lib/utils";

export function priorityClass(p: string) {
  if (p === "high") return "bg-rose-100 text-rose-700 border-rose-200";
  if (p === "medium") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-zinc-100 text-zinc-600 border-zinc-200";
}

export function statusClass(s: string) {
  if (
    s === "open" ||
    s === "processing" ||
    s === "out_for_delivery" ||
    s === "active"
  )
    return "bg-sky-100 text-sky-800 border-sky-200";
  if (s === "pending") return "bg-amber-100 text-amber-800 border-amber-200";
  if (s === "resolved" || s === "delivered" || s === "indexed")
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (s === "refunded" || s === "cancelled")
    return "bg-zinc-100 text-zinc-600 border-zinc-200";
  return "bg-zinc-100 text-zinc-600 border-zinc-200";
}

export function fieldClass() {
  return cn(
    "flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm outline-none",
    "placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-indigo-500",
  );
}
