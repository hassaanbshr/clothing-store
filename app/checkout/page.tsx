"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartItem } from "@/components/cart/cart-item";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clear);

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "CARD" | "ONLINE">("COD");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const placedRef = useRef(false);

  useEffect(() => {
    if (items.length === 0) return;
    const recordAbandoned = () => {
      if (placedRef.current) return;
      const totalValue = 100;
      fetch("/api/admin/abandoned-checkouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartSnapshot: items,
          totalValue,
        }),
        keepalive: true,
      }).catch(() => {});
    };
    const handle = () => recordAbandoned();
    window.addEventListener("beforeunload", handle);
    return () => window.removeEventListener("beforeunload", handle);
  }, [items]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode.trim(), orderAmount: 100 }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.discount != null) setDiscount(data.discount);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
          shippingAddress: address,
          paymentMethod,
          couponCode: couponCode.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.orderId) {
        placedRef.current = true;
        clearCart();
        router.push(`/account/orders/${data.orderId}`);
      } else {
        alert(data.error ?? "Failed to place order");
      }
    } catch {
      alert("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-semibold mb-4">Your cart is empty</h1>
        <Button asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="font-heading text-3xl font-semibold tracking-tight mb-8">
        Checkout
      </h1>
      <form onSubmit={handlePlaceOrder} className="space-y-8">
        <div>
          <h2 className="font-semibold mb-4">Shipping address</h2>
          <div className="grid gap-4">
            <Input
              placeholder="Street"
              value={address.street}
              onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                required
              />
              <Input
                placeholder="State"
                value={address.state}
                onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Postal code"
                value={address.postalCode}
                onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))}
                required
              />
              <Input
                placeholder="Country"
                value={address.country}
                onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))}
                required
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-4">Coupon</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <Button type="button" variant="outline" onClick={handleApplyCoupon}>
              Apply
            </Button>
          </div>
          {discount != null && (
            <p className="text-sm text-green-600 mt-1">Discount applied: ${discount.toFixed(2)}</p>
          )}
        </div>

        <div>
          <h2 className="font-semibold mb-4">Payment method</h2>
          <div className="flex gap-4">
            {(["COD", "CARD", "ONLINE"] as const).map((pm) => (
              <label key={pm} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === pm}
                  onChange={() => setPaymentMethod(pm)}
                />
                {pm === "COD" && "Cash on Delivery"}
                {pm === "CARD" && "Credit/Debit Card"}
                {pm === "ONLINE" && "Online Payment"}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-4">Order summary</h2>
          <ul className="divide-y">
            {items.map((item) => (
              <li key={`${item.productId}-${item.variantId ?? "n"}`} className="py-4">
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
        </div>

        <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Placing order..." : "Place order"}
        </Button>
      </form>
    </div>
  );
}
