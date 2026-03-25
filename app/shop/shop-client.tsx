"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { FilterIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react";
import Link from "next/link";
import { FilterSidebar } from "@/components/shop/filter-sidebar";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  createdAt: string;
  reviewCount: number;
  totalStock: number;
  previousPrice?: number | null;
  images: { url: string; alt?: string | null }[];
  variants: { id: string; colorName: string; colorHex?: string | null; stockQuantity?: number }[];
};

type Category = { id: string; name: string; slug: string };
type ColorOption = { colorName: string; colorHex?: string | null };

type Props = {
  initialData: {
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
    categories: Category[];
    filters: {
      sizeOptions: string[];
      colorOptions: ColorOption[];
      maxPrice: number;
    };
  };
  searchParams: Record<string, string | undefined>;
};

function parseMultiValue(input?: string) {
  return (input ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function ShopClient({ initialData, searchParams }: Props) {
  const router = useRouter();
  const currentParams = useSearchParams();
  const { products, total, page, totalPages, categories, filters } = initialData;
  const category = searchParams.category ?? "";
  const query = searchParams.q ?? "";
  const sort = searchParams.sort ?? "newest";
  const selectedSizes = parseMultiValue(searchParams.size);
  const selectedColors = parseMultiValue(searchParams.color);
  const maxAvailablePrice = Math.max(25, filters.maxPrice);
  const selectedMaxPrice = Number(searchParams.maxPrice ?? filters.maxPrice);
  const categoryTabValue = category || "all";
  const [queryInput, setQueryInput] = useState(query);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [priceDraft, setPriceDraft] = useState(
    Number.isFinite(selectedMaxPrice) && selectedMaxPrice > 0 ? selectedMaxPrice : maxAvailablePrice
  );

  useEffect(() => {
    setQueryInput(query);
  }, [query]);

  useEffect(() => {
    setPriceDraft(Number.isFinite(selectedMaxPrice) && selectedMaxPrice > 0 ? selectedMaxPrice : maxAvailablePrice);
  }, [selectedMaxPrice, maxAvailablePrice]);

  const createParams = () => new URLSearchParams(currentParams?.toString() ?? "");

  const setParam = (key: string, value: string) => {
    const p = createParams();
    if (value) p.set(key, value);
    else p.delete(key);
    if (key !== "page") p.set("page", "1");
    router.push(`/shop?${p.toString()}`);
  };

  const toggleMultiParam = (key: string, value: string) => {
    const p = createParams();
    const existing = parseMultiValue(p.get(key) ?? undefined);
    const next = existing.includes(value)
      ? existing.filter((entry) => entry !== value)
      : [...existing, value];

    if (next.length > 0) p.set(key, next.join(","));
    else p.delete(key);
    p.set("page", "1");
    router.push(`/shop?${p.toString()}`);
  };

  const clearFilters = () => {
    const p = createParams();
    p.delete("q");
    p.delete("size");
    p.delete("color");
    p.delete("maxPrice");
    p.delete("page");
    router.push(`/shop?${p.toString()}`);
    setMobileFiltersOpen(false);
  };

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParam("q", queryInput.trim());
  };

  const filterSidebar = (
    <FilterSidebar
      selectedSizes={selectedSizes}
      selectedColors={selectedColors}
      sizeOptions={filters.sizeOptions}
      colorOptions={filters.colorOptions.map((color) => ({
        name: color.colorName,
        hex: color.colorHex,
      }))}
      maxAvailablePrice={maxAvailablePrice}
      selectedMaxPrice={priceDraft}
      onToggleSize={(value) => toggleMultiParam("size", value)}
      onToggleColor={(value) => toggleMultiParam("color", value)}
      onPriceChange={setPriceDraft}
      onPriceCommit={(value) => setParam("maxPrice", value >= maxAvailablePrice ? "" : String(value))}
      onClear={clearFilters}
      className="sticky top-24"
    />
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
      <aside className="hidden lg:block">{filterSidebar}</aside>

      <div className="space-y-6">
        <div className="rounded-3xl border bg-card p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 border-b pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{total} products found</p>
                <p className="text-sm text-muted-foreground">
                  Clean layers, everyday essentials, and best-performing fits.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <FilterIcon className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                <div className="flex items-center gap-2">
                  <SlidersHorizontalIcon className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={sort}
                    onChange={(e) => setParam("sort", e.target.value)}
                    className="h-10 rounded-full border border-input bg-background px-4 text-sm shadow-sm"
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="popular">Popular</option>
                  </select>
                </div>
              </div>
            </div>

            <form onSubmit={applySearch} className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Search streetwear, essentials, tees..."
                  className="h-11 rounded-full pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="h-11 px-5">
                  Search
                </Button>
                {(query || selectedSizes.length > 0 || selectedColors.length > 0 || searchParams.maxPrice) && (
                  <Button type="button" variant="outline" className="h-11 px-5" onClick={clearFilters}>
                    Reset
                  </Button>
                )}
              </div>
            </form>
          </div>

          <div className="pt-4">
            <Tabs value={categoryTabValue} onValueChange={(v) => setParam("category", v === "all" ? "" : v)}>
              <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
                <TabsTrigger value="all" className="rounded-full border data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  All products
                </TabsTrigger>
                {categories.map((c) => (
                  <TabsTrigger
                    key={c.id}
                    value={c.slug}
                    className="rounded-full border data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {c.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        <ProductGrid products={products} />

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            {page > 1 && (
              <Button variant="outline" asChild>
                <Link
                  href={`/shop?${new URLSearchParams({
                    ...Object.fromEntries(currentParams?.entries() ?? []),
                    page: String(page - 1),
                  }).toString()}`}
                >
                  Previous
                </Link>
              </Button>
            )}
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Button variant="outline" asChild>
                <Link
                  href={`/shop?${new URLSearchParams({
                    ...Object.fromEntries(currentParams?.entries() ?? []),
                    page: String(page + 1),
                  }).toString()}`}
                >
                  Next
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="left" className="w-full max-w-sm overflow-y-auto">
          <SheetTitle className="sr-only">Product filters</SheetTitle>
          <div className="mt-8">{filterSidebar}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
