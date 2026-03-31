"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import type { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, slugify } from "@/lib/admin";
import {
  categorySchema,
  inventoryUpdateSchema,
  orderStatusSchema,
  saveProductSchema,
  storeSettingsSchema,
  type CategoryInput,
  type InventoryUpdateInput,
  type SaveProductInput,
  type StoreSettingsInput,
} from "@/lib/validations/admin";

type ActionResult<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function validationError<T = undefined>(
  error: ZodError
): ActionResult<T> {
  return {
    success: false,
    error: "Please correct the highlighted fields.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

function buildSku(slug: string, size: string, colorName: string) {
  return `${slug}-${size}-${colorName.replace(/\s+/g, "")}`.toUpperCase();
}

async function ensureAdmin() {
  const session = await requireAdminApi();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function saveProductAction(
  productId: string | null,
  input: SaveProductInput
): Promise<ActionResult<{ id: string }>> {
  try {
    await ensureAdmin();

    const parsed = saveProductSchema.safeParse(input);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { variants, imageUrls, ...rawData } = parsed.data;
    const slug = slugify(rawData.slug || rawData.name);

    const conflicting = await prisma.product.findFirst({
      where: {
        slug,
        ...(productId ? { NOT: { id: productId } } : {}),
      },
      select: { id: true },
    });

    if (conflicting) {
      return {
        success: false,
        error: "A product with this slug already exists.",
        fieldErrors: { slug: ["Slug already in use"] },
      };
    }

    const normalizedVariants = variants.map((variant) => ({
      ...variant,
      colorName: variant.colorName.trim(),
      size: variant.size.trim().toUpperCase(),
      sku: variant.sku?.trim() || buildSku(slug, variant.size.trim().toUpperCase(), variant.colorName.trim()),
    }));

    const product = await prisma.$transaction(async (tx) => {
      const saved = productId
        ? await tx.product.update({
            where: { id: productId },
            data: {
              name: rawData.name,
              slug,
              description: rawData.description ?? null,
              price: rawData.price,
              previousPrice: rawData.previousPrice ?? null,
              categoryId: rawData.categoryId,
              sizeChartJson: rawData.sizeChartJson ? (rawData.sizeChartJson as Prisma.InputJsonValue) : Prisma.JsonNull,
              modelSizeInfo: rawData.modelSizeInfo ?? null,
            },
          })
        : await tx.product.create({
            data: {
              name: rawData.name,
              slug,
              description: rawData.description ?? null,
              price: rawData.price,
              previousPrice: rawData.previousPrice ?? null,
              categoryId: rawData.categoryId,
              sizeChartJson: rawData.sizeChartJson ? (rawData.sizeChartJson as Prisma.InputJsonValue) : Prisma.JsonNull,
              modelSizeInfo: rawData.modelSizeInfo ?? null,
            },
          });

      await tx.productVariant.deleteMany({ where: { productId: saved.id } });
      await tx.productImage.deleteMany({ where: { productId: saved.id } });

      if (normalizedVariants.length > 0) {
        await tx.productVariant.createMany({
          data: normalizedVariants.map((variant) => ({
            productId: saved.id,
            size: variant.size,
            colorName: variant.colorName,
            colorHex: variant.colorHex || null,
            sku: variant.sku,
            stockQuantity: variant.stockQuantity,
            lowStockThreshold: variant.lowStockThreshold ?? 5,
          })),
        });
      }

      if (imageUrls.length > 0) {
        await tx.productImage.createMany({
          data: imageUrls.map((url, index) => ({
            productId: saved.id,
            url,
            sortOrder: index,
          })),
        });
      }

      return saved;
    });

    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
    revalidatePath(`/product/${product.id}`);

    return { success: true, data: { id: product.id } };
  } catch (error) {
    console.error("saveProductAction error", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save product.",
    };
  }
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  try {
    await ensureAdmin();

    const orderItemCount = await prisma.orderItem.count({ where: { productId } });
    if (orderItemCount > 0) {
      return {
        success: false,
        error: "Products with order history cannot be deleted. Consider marking it out of stock instead.",
      };
    }

    await prisma.product.delete({ where: { id: productId } });
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("deleteProductAction error", error);
    return { success: false, error: "Failed to delete product." };
  }
}

export async function saveCategoryAction(
  input: CategoryInput
): Promise<ActionResult<{ id: string }>> {
  try {
    await ensureAdmin();
    const parsed = categorySchema.safeParse(input);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { id, ...data } = parsed.data;
    const slug = slugify(data.slug || data.name);

    const existing = await prisma.category.findFirst({
      where: { slug, ...(id ? { NOT: { id } } : {}) },
      select: { id: true },
    });

    if (existing) {
      return {
        success: false,
        error: "A category with this slug already exists.",
        fieldErrors: { slug: ["Slug already in use"] },
      };
    }

    const category = id
      ? await prisma.category.update({
          where: { id },
          data: { ...data, slug },
        })
      : await prisma.category.create({
          data: { ...data, slug },
        });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");

    return { success: true, data: { id: category.id } };
  } catch (error) {
    console.error("saveCategoryAction error", error);
    return { success: false, error: "Failed to save category." };
  }
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionResult> {
  try {
    await ensureAdmin();

    const productCount = await prisma.product.count({ where: { categoryId } });
    if (productCount > 0) {
      return {
        success: false,
        error: "Move or delete products in this category before removing it.",
      };
    }

    await prisma.category.delete({ where: { id: categoryId } });
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return { success: true };
  } catch (error) {
    console.error("deleteCategoryAction error", error);
    return { success: false, error: "Failed to delete category." };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  status: string
): Promise<ActionResult> {
  try {
    await ensureAdmin();
    const parsed = orderStatusSchema.safeParse({ orderId, status });
    if (!parsed.success) {
      return { success: false, error: "Invalid order status." };
    }

    await prisma.order.update({
      where: { id: parsed.data.orderId },
      data: { status: parsed.data.status },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true };
  } catch (error) {
    console.error("updateOrderStatusAction error", error);
    return { success: false, error: "Failed to update order." };
  }
}

export async function updateInventoryAction(
  input: InventoryUpdateInput
): Promise<ActionResult<{ variantId: string }>> {
  try {
    await ensureAdmin();
    const parsed = inventoryUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const variant = await prisma.productVariant.update({
      where: { id: parsed.data.variantId },
      data: {
        stockQuantity: parsed.data.stockQuantity,
        lowStockThreshold: parsed.data.lowStockThreshold,
      },
      select: {
        id: true,
        productId: true,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${variant.productId}`);
    revalidatePath("/shop");

    return {
      success: true,
      data: { variantId: variant.id },
    };
  } catch (error) {
    console.error("updateInventoryAction error", error);
    return { success: false, error: "Failed to update inventory." };
  }
}

export async function saveStoreSettingsAction(
  input: StoreSettingsInput
): Promise<ActionResult> {
  try {
    await ensureAdmin();
    const parsed = storeSettingsSchema.safeParse(input);
    if (!parsed.success) {
      return validationError(parsed.error);
    }

    await prisma.storeSettings.upsert({
      where: { singletonKey: "default" },
      update: {
        storeName: parsed.data.storeName,
        supportEmail: parsed.data.supportEmail || null,
        supportPhone: parsed.data.supportPhone || null,
        shippingThreshold: parsed.data.shippingThreshold ?? null,
        currencyCode: parsed.data.currencyCode,
      },
      create: {
        singletonKey: "default",
        storeName: parsed.data.storeName,
        supportEmail: parsed.data.supportEmail || null,
        supportPhone: parsed.data.supportPhone || null,
        shippingThreshold: parsed.data.shippingThreshold ?? null,
        currencyCode: parsed.data.currencyCode,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/settings");
    revalidatePath("/");
    revalidatePath("/checkout");

    return { success: true };
  } catch (error) {
    console.error("saveStoreSettingsAction error", error);
    return { success: false, error: "Failed to save store settings." };
  }
}
