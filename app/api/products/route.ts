import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin";
import { createProductSchema } from "@/lib/validations/product";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const slug = searchParams.get("slug");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const size = searchParams.get("size");
    const color = searchParams.get("color");
    const q = searchParams.get("q");
    const sort = searchParams.get("sort") ?? "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(24, Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (category) {
      const cat = await prisma.category.findUnique({ where: { slug: category } });
      if (cat) where.categoryId = cat.id;
    }
    if (slug) where.slug = slug;
    if (q && q.trim()) {
      where.OR = [
        { name: { contains: q.trim() } },
        { description: { contains: q.trim() } },
      ];
    }
    if (minPrice != null && minPrice !== "") {
      const num = parseFloat(minPrice);
      if (!Number.isNaN(num)) where.price = { ...(where.price as { gte?: number; lte?: number }), gte: num };
    }
    if (maxPrice != null && maxPrice !== "") {
      const num = parseFloat(maxPrice);
      if (!Number.isNaN(num))
        where.price = { ...(where.price as { gte?: number; lte?: number }), lte: num };
    }
    if (size || color) {
      where.variants = {
        some: {
          ...(size ? { size } : {}),
          ...(color ? { colorName: { contains: color } } : {}),
        },
      };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === "price_asc"
        ? { price: "asc" }
        : sort === "price_desc"
          ? { price: "desc" }
          : { createdAt: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 3 },
          variants: true,
          category: true,
          _count: { select: { reviews: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const serialized = products.map((p) => ({
      ...p,
      price: Number(p.price),
      previousPrice: p.previousPrice ? Number(p.previousPrice) : null,
      images: p.images,
      variants: p.variants,
      category: p.category,
      reviewCount: p._count.reviews,
    }));

    return NextResponse.json({
      products: serialized,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error("Products fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { imageUrls, variants, ...data } = parsed.data;
    const product = await prisma.product.create({
      data: {
        ...data,
        previousPrice: data.previousPrice ?? null,
        sizeChartJson: data.sizeChartJson != null ? (data.sizeChartJson as object) : undefined,
        modelSizeInfo: data.modelSizeInfo ?? undefined,
      },
    });
    if (imageUrls?.length) {
      await prisma.productImage.createMany({
        data: imageUrls.map((url, i) => ({
          productId: product.id,
          url,
          sortOrder: i,
        })),
      });
    }
    for (const v of variants) {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          size: v.size,
          colorName: v.colorName,
          colorHex: v.colorHex,
          stockQuantity: v.stockQuantity,
          lowStockThreshold: v.lowStockThreshold ?? 5,
          sku: `${product.slug}-${v.size}-${v.colorName.replace(/\s/g, "")}`.toUpperCase(),
        },
      });
    }
    const full = await prisma.product.findUnique({
      where: { id: product.id },
      include: { images: true, variants: true, category: true },
    });
    return NextResponse.json(full);
  } catch (e) {
    console.error("Product create error:", e);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
