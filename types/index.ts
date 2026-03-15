import type { Product, ProductImage, ProductVariant, Category, Order, OrderItem, Review, User, Address, Coupon } from "@prisma/client";

export type { Product, ProductImage, ProductVariant, Category, Order, OrderItem, Review, User, Address, Coupon };

export type CartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export type ProductWithDetails = Product & {
  images: ProductImage[];
  variants: ProductVariant[];
  category: Category;
  _count?: { reviews: number };
};

export type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[];
  shippingAddress: Address;
};

export type SizeChartRow = {
  size: string;
  chest?: number;
  waist?: number;
  hip?: number;
  length?: number;
  [key: string]: number | string | undefined;
};
