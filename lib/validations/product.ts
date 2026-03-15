import { z } from "zod";

export const productVariantSchema = z.object({
  size: z.string().min(1),
  colorName: z.string().min(1),
  colorHex: z.string().optional(),
  sku: z.string().optional(),
  stockQuantity: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().optional(),
  price: z.number().positive(),
  previousPrice: z.number().positive().optional().nullable(),
  categoryId: z.string().min(1),
  sizeChartJson: z.record(z.unknown()).optional().nullable(),
  modelSizeInfo: z.string().optional().nullable(),
  variants: z.array(productVariantSchema).min(1),
  imageUrls: z.array(z.string().url()).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
