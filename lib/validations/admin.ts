import { z } from "zod";
import { createProductSchema } from "@/lib/validations/product";

export const saveProductSchema = createProductSchema.omit({
  slug: true,
  sizeChartJson: true,
  imageUrls: true,
}).extend({
  slug: z
    .string()
    .regex(/^[a-z0-9-]*$/, "Slug must use lowercase letters, numbers, and hyphens")
    .optional()
    .or(z.literal("")),
  imageUrls: z.array(z.string().url()).default([]),
  sizeChartJson: z.array(z.record(z.union([z.string(), z.number()]))).optional().nullable(),
});

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must use lowercase letters, numbers, and hyphens"),
  order: z.number().int().min(0).default(0),
});

export const orderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export const inventoryUpdateSchema = z.object({
  variantId: z.string().min(1),
  stockQuantity: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0),
});

export const storeSettingsSchema = z.object({
  storeName: z.string().min(2, "Store name is required"),
  supportEmail: z.string().email("Enter a valid support email").nullable().optional(),
  supportPhone: z.string().max(40).nullable().optional(),
  shippingThreshold: z.number().min(0).nullable().optional(),
  currencyCode: z
    .string()
    .min(3)
    .max(3)
    .transform((value) => value.toUpperCase()),
});

export type SaveProductInput = z.infer<typeof saveProductSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type OrderStatusInput = z.infer<typeof orderStatusSchema>;
export type InventoryUpdateInput = z.infer<typeof inventoryUpdateSchema>;
export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;
