"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  previousPrice?: number | null;
  images: { url: string; alt?: string | null }[];
  variants: { id: string; colorName: string; colorHex?: string | null }[];
};

type Category = { id: string; name: string; slug: string };

type Props = {
  initialData: {
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
    categories: Category[];
  };
  searchParams: Record<string, string | undefined>;
};

export function ShopClient({ initialData, searchParams }: Props) {
  const router = useRouter();
  const currentParams = useSearchParams();
  const { products, total, page, totalPages, categories } = initialData;
  const category = searchParams.category ?? "";
  const sort = searchParams.sort ?? "newest";
  const categoryTabValue = category || "all";

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(currentParams?.toString() ?? "");
    p.set(key, value);
    if (key !== "page") p.set("page", "1");
    router.push(`/shop?${p.toString()}`);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <Tabs value={categoryTabValue} onValueChange={(v) => setParam("category", v === "all" ? "" : v)}>
          <TabsList>
            <TabsTrigger value="all">All products</TabsTrigger>
            {categories.map((c) => (
              <TabsTrigger key={c.id} value={c.slug}>
                {c.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort:</span>
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Popular</option>
          </select>
        </div>
      </div>

      <ProductGrid products={products} />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {page > 1 && (
            <Button variant="outline" asChild>
              <Link href={`/shop?${new URLSearchParams({ ...Object.fromEntries(currentParams?.entries() ?? []), page: String(page - 1) }).toString()}`}>
                Previous
              </Link>
            </Button>
          )}
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Button variant="outline" asChild>
              <Link href={`/shop?${new URLSearchParams({ ...Object.fromEntries(currentParams?.entries() ?? []), page: String(page + 1) }).toString()}`}>
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </>
  );
}
