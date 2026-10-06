import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Product } from "../mock/products";
import { useProductsStore } from "../store/productsStore";
import DomainLoadState from "./DomainLoadState";
import PanelShell from "./PanelShell";
import ProductFormDialog from "./ProductFormDialog";
import ProductTableRow from "./ProductListItem";

type SortKey = "name" | "category" | "price" | "stock";

export default function ProductsPanel() {
  const products = useProductsStore((s) => s.products);
  const status = useProductsStore((s) => s.status);
  const error = useProductsStore((s) => s.error);
  const load = useProductsStore((s) => s.load);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({
    key: "name",
    dir: 1,
  });

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setOpen(true);
  }

  function toggleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 1 ? -1 : 1 } : { key, dir: 1 },
    );
  }

  const categories = useMemo(() => {
    const out: string[] = [];
    for (const p of products) {
      if (!out.includes(p.category)) out.push(p.category);
    }
    return out.sort((a, b) => a.localeCompare(b));
  }, [products]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      const inCat = category === "All" || p.category === category;
      const inQ =
        !q ||
        `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q);
      return inCat && inQ;
    });
    const { key, dir } = sort;
    list.sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === "string" && typeof bv === "string") {
        return av.localeCompare(bv) * dir;
      }
      return ((av as number) - (bv as number)) * dir;
    });
    return list;
  }, [products, query, category, sort]);

  const description =
    status === "ready"
      ? `${products.length} products in the catalog.`
      : "Catalog the agent and storefront share — edits apply live.";

  return (
    <PanelShell
      title="Products"
      description={description}
      action={
        <Button
          size="sm"
          type="button"
          onClick={openCreate}
          disabled={status !== "ready"}
        >
          <Plus data-icon="inline-start" />
          Add product
        </Button>
      }
    >
      <DomainLoadState
        status={status}
        error={error}
        onRetry={() => void load({ force: true })}
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2.5">
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className="w-[220px]"
            />
            <select
              className="rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm"
              aria-label="Filter by category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-12 overflow-x-auto rounded-2xl border border-border bg-card">
          <Table className="min-w-[620px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <SortHead
                  label="Product"
                  active={sort.key === "name"}
                  dir={sort.dir}
                  onClick={() => toggleSort("name")}
                />
                <SortHead
                  label="Category"
                  active={sort.key === "category"}
                  dir={sort.dir}
                  onClick={() => toggleSort("category")}
                />
                <SortHead
                  label="Price"
                  active={sort.key === "price"}
                  dir={sort.dir}
                  onClick={() => toggleSort("price")}
                  className="text-right"
                />
                <SortHead
                  label="Stock"
                  active={sort.key === "stock"}
                  dir={sort.dir}
                  onClick={() => toggleSort("stock")}
                />
                <TableHead className="bg-foreground/[0.03] px-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <td
                    colSpan={5}
                    className="px-4 py-7 text-muted-foreground"
                  >
                    No products match. Clear the search or add a new product.
                  </td>
                </TableRow>
              ) : (
                rows.map((p) => (
                  <ProductTableRow
                    key={p.id}
                    product={p}
                    onEdit={openEdit}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DomainLoadState>

      <ProductFormDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
      />
    </PanelShell>
  );
}

function SortHead({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: 1 | -1;
  onClick: () => void;
  className?: string;
}) {
  return (
    <TableHead
      className={`bg-foreground/[0.03] px-4 text-[0.86rem] font-semibold whitespace-nowrap text-muted-foreground ${className ?? ""}`}
      aria-sort={
        active ? (dir === 1 ? "ascending" : "descending") : "none"
      }
    >
      <button
        type="button"
        className="inline-flex items-center gap-1.5 font-semibold text-inherit"
        onClick={onClick}
      >
        {label}
        <span
          className={`inline-block border-x-4 border-x-transparent ${
            active && dir === 1
              ? "border-b-[5px] border-b-current opacity-100"
              : "border-t-[5px] border-t-current"
          } ${active ? "opacity-100" : "opacity-30"}`}
          aria-hidden
        />
      </button>
    </TableHead>
  );
}
