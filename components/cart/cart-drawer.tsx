"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useUIStore } from "@/store/ui";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { CartItem } from "./cart-item";

export function CartDrawer() {
  const cartOpen = useUIStore((s) => s.cartOpen);
  const closeCart = useUIStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);

  return (
    <Sheet open={cartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="flex flex-col w-full max-w-md">
        <SheetTitle className="sr-only">Shopping Cart</SheetTitle>
        <div className="flex-1 overflow-auto">
          <h2 className="text-lg font-semibold mb-4">Your Cart</h2>
          {items.length === 0 ? (
            <p className="text-muted-foreground text-sm">Your cart is empty.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <CartItem
                  key={`${item.productId}-${item.variantId ?? "n"}`}
                  productId={item.productId}
                  variantId={item.variantId}
                  quantity={item.quantity}
                  onRemove={() => useCartStore.getState().removeItem(item.productId, item.variantId)}
                  onQuantityChange={(q) =>
                    useCartStore.getState().updateQuantity(item.productId, item.variantId, q)
                  }
                />
              ))}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <Button asChild className="w-full">
              <Link href="/checkout" onClick={closeCart}>
                Proceed to Checkout
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full mt-2">
              <Link href="/cart" onClick={closeCart}>
                View Cart
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
