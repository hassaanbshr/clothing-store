import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().optional(),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  isDefault: z.boolean().optional(),
});

export const checkoutItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().int().positive(),
});

export const checkoutSchema = z.object({
  shippingAddress: addressSchema.or(z.object({ addressId: z.string() })),
  paymentMethod: z.enum(["COD", "CARD", "ONLINE"]),
  couponCode: z.string().optional(),
  items: z.array(checkoutItemSchema).min(1, "Cart is empty"),
});

export const couponValidateSchema = z.object({
  code: z.string().min(1),
  orderAmount: z.number().nonnegative(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
