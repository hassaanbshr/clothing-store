import { Suspense } from "react";
import type { Prisma } from "@prisma/client";
import { ShopClient } from "./shop-client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getInitialProducts(searchParams: Record<string, string | undefined>) {
  const category = searchParams.category;
  const sort = searchParams.sort ?? "newest";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const limit = 12;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {};
  if (category) {
    const cat = await prisma.category.findUnique({ where: { slug: category } });
    if (cat) where.categoryId = cat.id;
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
        ? { price: "desc" }
        : sort === "popular"
          ? { reviews: { _count: "desc" } }
          : { createdAt: "desc" };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 2 },
        variants: true,
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  const serialized = products.map((p) => ({
    ...p,
    price: Number(p.price),
    previousPrice: p.previousPrice ? Number(p.previousPrice) : null,
  }));

  return {
    products: serialized,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    categories,
  };
}

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const data = await getInitialProducts(params);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-semibold tracking-tight mb-8">
        Shop
      </h1>
      <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
        <ShopClient
          initialData={data}
          searchParams={params}
        />
      </Suspense>
    </div>
  );
}
