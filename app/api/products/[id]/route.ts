import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin";
import { updateProductSchema } from "@/lib/validations/product";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
        category: true,
        _count: { select: { reviews: true } },
      },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({
      ...product,
      price: Number(product.price),
      previousPrice: product.previousPrice ? Number(product.previousPrice) : null,
    });
  } catch (e) {
    console.error("Product fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { imageUrls, variants, ...data } = parsed.data;
    await prisma.product.update({
      where: { id },
      data: {
        ...data,
        previousPrice: data.previousPrice ?? undefined,
        sizeChartJson: data.sizeChartJson != null ? (data.sizeChartJson as object) : undefined,
        modelSizeInfo: data.modelSizeInfo ?? undefined,
      },
    });
    if (imageUrls) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      if (imageUrls.length > 0) {
        await prisma.productImage.createMany({
          data: imageUrls.map((url, i) => ({
            productId: id,
            url,
            sortOrder: i,
          })),
        });
      }
    }
    if (variants) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      const product = await prisma.product.findUnique({ where: { id } });
      if (product) {
        for (const v of variants) {
          await prisma.productVariant.create({
            data: {
              productId: id,
              size: v.size,
              colorName: v.colorName,
              colorHex: v.colorHex,
              stockQuantity: v.stockQuantity,
              lowStockThreshold: v.lowStockThreshold ?? 5,
              sku: `${product.slug}-${v.size}-${v.colorName.replace(/\s/g, "")}`.toUpperCase(),
            },
          });
        }
      }
    }
    const updated = await prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true, category: true },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("Product update error:", e);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Product delete error:", e);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
