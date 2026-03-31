import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminProductsTable } from "@/components/admin/admin-products-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
  }>;
};

export default async function AdminProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const selectedCategory = params.category ?? "";
  const page = Math.max(1, Number(params.page ?? "1"));
  const pageSize = 12;

  const where: Prisma.ProductWhereInput = {
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(selectedCategory ? { categoryId: selectedCategory } : {}),
  };

  const [products, categories, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: true,
        _count: { select: { reviews: true, variants: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const createPageHref = (nextPage: number) => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (selectedCategory) next.set("category", selectedCategory);
    next.set("page", String(nextPage));
    return `/admin/products?${next.toString()}`;
  };

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Search, filter, and manage your catalog with full merchandising controls."
        action={
          <Button asChild>
            <Link href="/admin/products/new">Add product</Link>
          </Button>
        }
      />

      <form className="mb-6 grid gap-3 rounded-[1.5rem] border bg-card p-4 shadow-sm md:grid-cols-[1fr_220px_auto]">
        <Input name="q" defaultValue={query} placeholder="Search by name, slug, or description" />
        <select
          name="category"
          defaultValue={selectedCategory}
          className="h-8 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Apply filters
        </Button>
      </form>

      {products.length === 0 ? (
        <AdminEmptyState
          title="No products found"
          description="Try adjusting your filters or add a new product to start building the catalog."
          action={
            <Button asChild>
              <Link href="/admin/products/new">Create product</Link>
            </Button>
          }
        />
      ) : (
        <>
          <AdminProductsTable
            products={products.map((product) => ({
              id: product.id,
              name: product.name,
              slug: product.slug,
              categoryName: product.category.name,
              price: Number(product.price),
              previousPrice: product.previousPrice ? Number(product.previousPrice) : null,
              reviewCount: product._count.reviews,
              totalStock: product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0),
              variantCount: product._count.variants,
            }))}
          />

          <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total} products
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild disabled={page <= 1}>
                <Link href={createPageHref(page - 1)}>Previous</Link>
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" asChild disabled={page >= totalPages}>
                <Link href={createPageHref(page + 1)}>Next</Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
