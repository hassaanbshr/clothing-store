"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { useSession } from "next-auth/react";
import { CreditCardIcon, ShieldCheckIcon, TruckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderSummary } from "@/components/checkout/order-summary";

const FREE_SHIPPING_THRESHOLD = 150;
const STANDARD_SHIPPING = 12;

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

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "CARD" | "ONLINE">("COD");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [summaryItems, setSummaryItems] = useState<SummaryItem[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const placedRef = useRef(false);
  const subtotal = summaryItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const total = Math.max(subtotal + shippingFee - discount, 0);

  useEffect(() => {
    let cancelled = false;

    if (items.length === 0) {
      setSummaryItems([]);
      return;
    }

    setSummaryLoading(true);
    Promise.all(
      items.map(async (item) => {
        const res = await fetch(`/api/products/${item.productId}`);
        if (!res.ok) return null;
        const data = await res.json();
        const variant = data.variants?.find((entry: { id: string }) => entry.id === item.variantId);

        return {
          key: `${item.productId}-${item.variantId ?? "default"}`,
          productId: item.productId,
          name: data.name,
          slug: data.slug,
          quantity: item.quantity,
          price: Number(data.price),
          image: data.images?.[0]?.url,
          size: variant?.size,
          colorName: variant?.colorName,
        } satisfies SummaryItem;
      })
    )
      .then((nextItems) => {
        if (!cancelled) {
          setSummaryItems(nextItems.filter(Boolean) as SummaryItem[]);
        }
      })
      .finally(() => {
        if (!cancelled) setSummaryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [items]);

  useEffect(() => {
    if (items.length === 0) return;
    const recordAbandoned = () => {
      if (placedRef.current) return;
      fetch("/api/admin/abandoned-checkouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartSnapshot: items,
          totalValue: total,
        }),
        keepalive: true,
      }).catch(() => {});
    };
    const handle = () => recordAbandoned();
    window.addEventListener("beforeunload", handle);
    return () => window.removeEventListener("beforeunload", handle);
  }, [items, total]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || subtotal <= 0) return;
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode.trim(), orderAmount: subtotal }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.discount != null) {
      setDiscount(Number(data.discount));
      setCouponMessage(`Coupon applied. You saved $${Number(data.discount).toFixed(2)}.`);
    } else {
      setDiscount(0);
      setCouponMessage(data.error ?? "Coupon could not be applied.");
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!session) {
      router.push("/auth/login?callbackUrl=/checkout");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
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
        setErrorMessage(data.error ?? "Failed to place order");
      }
    } catch {
      setErrorMessage("Failed to place order");
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
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Checkout</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Fast, secure checkout with shipping details up front and COD ready at delivery.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border px-3 py-1">Free shipping over ${FREE_SHIPPING_THRESHOLD}</span>
          <span className="rounded-full border px-3 py-1">Cash on Delivery Available</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          {!session && (
            <div className="rounded-[1.5rem] border border-amber-500/40 bg-amber-500/10 p-5">
              <p className="text-sm font-medium">Sign in required to place your order</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your cart is ready. Sign in now and we will keep you on the fastest path to checkout.
              </p>
              <Button asChild className="mt-4">
                <Link href="/auth/login?callbackUrl=/checkout">Sign In to Continue</Link>
              </Button>
            </div>
          )}

          <div className="rounded-[1.75rem] border bg-card p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">1. Shipping details</h2>
              <p className="text-sm text-muted-foreground">
                Tell us where to deliver your order. We will confirm the details after purchase.
              </p>
            </div>
            <div className="grid gap-4">
              <Input
                placeholder="Street address"
                value={address.street}
                onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
                className="h-11"
                required
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  placeholder="City"
                  value={address.city}
                  onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                  className="h-11"
                  required
                />
                <Input
                  placeholder="State / Province"
                  value={address.state}
                  onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                  className="h-11"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  placeholder="Postal code"
                  value={address.postalCode}
                  onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))}
                  className="h-11"
                  required
                />
                <Input
                  placeholder="Country"
                  value={address.country}
                  onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))}
                  className="h-11"
                  required
                />
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border bg-card p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">2. Delivery & payment</h2>
              <p className="text-sm text-muted-foreground">
                Keep it simple with cash on delivery. Digital payment options can be added later without changing the flow.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("COD")}
                className="rounded-2xl border border-primary bg-primary/5 p-4 text-left"
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ShieldCheckIcon className="h-4 w-4 text-primary" />
                  Cash on Delivery
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Pay when your order arrives.</p>
              </button>

              <div className="rounded-2xl border bg-muted/30 p-4 text-left opacity-70">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                  Credit / Debit Card
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Coming soon</p>
              </div>

              <div className="rounded-2xl border bg-muted/30 p-4 text-left opacity-70">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <TruckIcon className="h-4 w-4 text-muted-foreground" />
                  Online Payment
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Coming soon</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border bg-card p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">3. Offers</h2>
              <p className="text-sm text-muted-foreground">Apply a coupon before placing your order.</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="h-11"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleApplyCoupon}
                className="h-11"
                disabled={subtotal <= 0 || summaryLoading}
              >
                Apply
              </Button>
            </div>
            {couponMessage && (
              <p className="mt-3 text-sm text-muted-foreground">{couponMessage}</p>
            )}
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {errorMessage}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <OrderSummary
            items={summaryItems}
            subtotal={subtotal}
            discount={discount}
            shippingFee={shippingFee}
            total={total}
            loading={summaryLoading}
          />

          <div className="rounded-[1.75rem] border bg-card p-5 shadow-sm">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>COD confirmed at delivery. Shipping updates are shared after your order is placed.</p>
              <p>{shippingFee === 0 ? "You unlocked free shipping." : `Add $${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free shipping.`}</p>
            </div>
            <Button type="submit" size="lg" disabled={loading || summaryLoading || !session} className="mt-5 h-12 w-full">
              {loading ? "Placing order..." : session ? "Place Order" : "Sign In to Place Order"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
