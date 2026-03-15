"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/components/cart/cart-item";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="font-heading text-3xl font-semibold tracking-tight mb-8">
        Your Cart
      </h1>
      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Your cart is empty.</p>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <ul className="divide-y">
            {items.map((item) => (
              <li key={`${item.productId}-${item.variantId ?? "n"}`} className="py-6">
                <CartItem
                  productId={item.productId}
                  variantId={item.variantId}
                  quantity={item.quantity}
                  onRemove={() => removeItem(item.productId, item.variantId)}
                  onQuantityChange={(q) =>
                    updateQuantity(item.productId, item.variantId, q)
                  }
                />
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-4 justify-end items-end pt-6 border-t">
            <p className="text-sm text-muted-foreground mr-auto">Subtotal calculated at checkout.</p>
            <Button asChild size="lg">
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
