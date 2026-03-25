import { Suspense } from "react";
import type { Prisma } from "@prisma/client";
import { ShopClient } from "./shop-client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SIZE_OPTIONS = ["S", "M", "L", "XL"] as const;
const NEW_ARRIVAL_WINDOW_MS = 1000 * 60 * 60 * 24 * 45;

function parseMultiValue(input?: string) {
  return (input ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

async function getInitialProducts(searchParams: Record<string, string | undefined>) {
  const category = searchParams.category;
  const query = searchParams.q?.trim();
  const sort = searchParams.sort ?? "newest";
  const selectedSizes = parseMultiValue(searchParams.size);
  const selectedColors = parseMultiValue(searchParams.color);
  const maxPrice = Number(searchParams.maxPrice ?? "");
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const limit = 12;
  const skip = (page - 1) * limit;

  const baseWhere: Prisma.ProductWhereInput = {};
  if (category) {
    baseWhere.category = { is: { slug: category } };
  }
  if (query) {
    baseWhere.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { slug: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { category: { is: { name: { contains: query, mode: "insensitive" } } } },
    ];
  }

  const variantFilter: Prisma.ProductVariantWhereInput = {};
  if (selectedSizes.length > 0) {
    variantFilter.size = { in: selectedSizes };
  }
  if (selectedColors.length > 0) {
    variantFilter.colorName = { in: selectedColors };
  }

  const where: Prisma.ProductWhereInput = {
    ...baseWhere,
    ...(Object.keys(variantFilter).length > 0 ? { variants: { some: variantFilter } } : {}),
    ...(Number.isFinite(maxPrice) && maxPrice > 0 ? { price: { lte: maxPrice } } : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
        ? { price: "desc" }
        : sort === "popular"
          ? { reviews: { _count: "desc" } }
          : { createdAt: "desc" };

  const [products, total, categories, colorOptions, priceMeta] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 2 },
        variants: true,
        _count: { select: { reviews: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.productVariant.findMany({
      where: { product: { is: baseWhere } },
      select: { colorName: true, colorHex: true },
      distinct: ["colorName"],
      orderBy: { colorName: "asc" },
    }),
    prisma.product.aggregate({
      where: baseWhere,
      _max: { price: true },
    }),
  ]);

  const serialized = products.map((p) => ({
    ...p,
    price: Number(p.price),
    previousPrice: p.previousPrice ? Number(p.previousPrice) : null,
    createdAt: p.createdAt.toISOString(),
    isNewArrival: Date.now() - p.createdAt.getTime() <= NEW_ARRIVAL_WINDOW_MS,
    reviewCount: p._count.reviews,
    totalStock: p.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0),
  }));

  return {
    products: serialized,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    categories,
    filters: {
      sizeOptions: [...SIZE_OPTIONS],
      colorOptions,
      maxPrice: Number(priceMeta._max.price ?? 200),
    },
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
