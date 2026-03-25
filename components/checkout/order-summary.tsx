"use client";

import Image from "next/image";
import Link from "next/link";
import { resolveProductImage } from "@/lib/demo-images";

type SummaryItem = {
  key: string;
  productId: string;
  name: string;
  slug?: string;
  quantity: number;
  price: number;
  image?: string;
  size?: string;
  colorName?: string;
};

type OrderSummaryProps = {
  items: SummaryItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  loading?: boolean;
};

export function OrderSummary({
  items,
  subtotal,
  discount,
  shippingFee,
  total,
  loading = false,
}: OrderSummaryProps) {
  return (
    <div className="rounded-[1.75rem] border bg-card p-5 shadow-sm lg:sticky lg:top-24">
      <div className="flex items-start justify-between gap-3 border-b pb-4">
        <div>
          <h2 className="text-lg font-semibold">Order summary</h2>
          <p className="text-sm text-muted-foreground">Review your order before placing it.</p>
        </div>
        <Link href="/cart" className="text-sm font-medium text-primary hover:underline">
          Edit cart
        </Link>
      </div>

      <div className="space-y-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-16 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : (
          items.map((item) => {
            const image = resolveProductImage({
              src: item.image,
              slug: item.slug ?? item.productId,
              name: item.name,
            });

            return (
              <div key={item.key} className="flex gap-3 rounded-2xl border bg-muted/20 p-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized={image.startsWith("/placeholder") || image.startsWith("/demo/")}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.colorName ?? "Default color"}
                    {item.size ? ` / ${item.size}` : ""}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Qty {item.quantity}</span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="space-y-3 border-t pt-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{shippingFee === 0 ? "Free" : `$${shippingFee.toFixed(2)}`}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Discount</span>
          <span>{discount > 0 ? `-$${discount.toFixed(2)}` : "$0.00"}</span>
        </div>
        <div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
