import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin";
import { updateProductSchema } from "@/lib/validations/product";

const VARIANT_ORDER_HISTORY_ERROR =
  "Variants with order history cannot be removed. Set their stock to 0 instead.";

function isKnownPrismaError(
  error: unknown,
  code: string
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}

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
    await prisma.$transaction(async (tx) => {
      const saved = await tx.product.update({
        where: { id },
        data: {
          ...data,
          previousPrice: data.previousPrice ?? undefined,
          sizeChartJson: data.sizeChartJson != null ? (data.sizeChartJson as object) : undefined,
          modelSizeInfo: data.modelSizeInfo ?? undefined,
        },
      });
      if (imageUrls) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (imageUrls.length > 0) {
          await tx.productImage.createMany({
            data: imageUrls.map((url, i) => ({
              productId: id,
              url,
              sortOrder: i,
            })),
          });
        }
      }
      if (variants) {
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: id },
          select: { id: true, orderItems: { select: { id: true }, take: 1 } },
        });
        const existingVariantIds = new Set(existingVariants.map((variant) => variant.id));
        const submittedVariantIds = new Set(
          variants
            .map((variant) => variant.variantId)
            .filter((variantId): variantId is string => Boolean(variantId))
        );
        const variantsToRemove = existingVariants.filter(
          (variant) => !submittedVariantIds.has(variant.id)
        );
        const variantsWithOrderHistory = variantsToRemove.filter(
          (variant) => variant.orderItems.length > 0
        );

        if (variantsWithOrderHistory.length > 0) {
          throw new Error(VARIANT_ORDER_HISTORY_ERROR);
        }

        if (variantsToRemove.length > 0) {
          await tx.productVariant.deleteMany({
            where: {
              productId: id,
              id: { in: variantsToRemove.map((variant) => variant.id) },
            },
          });
        }

        for (const v of variants) {
          const variantData = {
            size: v.size,
            colorName: v.colorName,
            colorHex: v.colorHex,
            stockQuantity: v.stockQuantity,
            lowStockThreshold: v.lowStockThreshold ?? 5,
            sku: v.sku?.trim() || `${saved.slug}-${v.size}-${v.colorName.replace(/\s/g, "")}`.toUpperCase(),
          };

          if (v.variantId && existingVariantIds.has(v.variantId)) {
            await tx.productVariant.update({
              where: { id: v.variantId },
              data: variantData,
            });
          } else {
            await tx.productVariant.create({
              data: {
                ...variantData,
                productId: id,
              },
            });
          }
        }
      }
    });
    const updated = await prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true, category: true },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("Product update error:", e);
    if (e instanceof Error && e.message === VARIANT_ORDER_HISTORY_ERROR) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    if (isKnownPrismaError(e, "P2003")) {
      return NextResponse.json({ error: VARIANT_ORDER_HISTORY_ERROR }, { status: 400 });
    }
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
