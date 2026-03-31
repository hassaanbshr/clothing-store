"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { HeartIcon, RulerIcon, ShieldCheckIcon, TruckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MotionItem, MotionReveal, MotionStagger, premiumEase } from "@/components/shared/motion";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { SizeChartModal } from "@/components/product/size-chart-modal";
import { SizeRecommendationTool } from "@/components/product/size-recommendation-tool";
import { CompleteTheLook } from "@/components/product/complete-the-look";
import { ReviewForm } from "@/components/product/review-form";
import { RecentlyViewed } from "@/components/shared/recently-viewed";
import { resolveProductImage } from "@/lib/demo-images";
import { formatCurrency, formatReviewCount } from "@/lib/storefront";
import { cn } from "@/lib/utils";

type Variant = {
  id: string;
  size: string;
  colorName: string;
  colorHex?: string | null;
  stockQuantity: number;
  lowStockThreshold?: number;
};

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string | null };
};

type Product = {
  id: string;
  name: string;
  slug?: string;
  description: string | null;
  price: number;
  previousPrice: number | null;
  sizeChartJson: unknown;
  modelSizeInfo: string | null;
  images: { id: string; url: string; alt: string | null }[];
  variants: Variant[];
  category: { name: string; slug: string };
  reviews: Review[];
};

type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  previousPrice: number | null;
  images: { url: string }[];
  variants: Variant[];
};

export function ProductDetailClient({
  product,
  related,
}: {
  product: Product;
  related: RelatedProduct[];
}) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [sizeToolOpen, setSizeToolOpen] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isInWishlist = useWishlistStore((s) => s.has(product.id));
  const addItem = useCartStore((s) => s.addItem);
  const addRecentlyViewed = useUIStore((s) => s.addRecentlyViewed);

  useEffect(() => {
    addRecentlyViewed(product.id);
  }, [product.id, addRecentlyViewed]);

  const colors = [...new Map(product.variants.map((v) => [v.colorName, v])).values()];
  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const firstColor = colors[0]?.colorName;
  const firstSize = sizes[0];
  const selectedVariant = product.variants.find(
    (v) => v.size === (selectedSize ?? firstSize) && v.colorName === (selectedColor ?? firstColor)
  ) ?? product.variants[0];
  const currentImages = product.images;
  const mainImage = currentImages[mainImageIndex] ?? currentImages[0];
  const mainImageSrc = resolveProductImage({
    src: mainImage?.url,
    slug: product.slug ?? product.id,
    name: product.name,
    index: mainImageIndex,
  });
  const onSale = product.previousPrice != null && product.previousPrice > product.price;
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length
      : null;
  const totalStock = product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0);
  const stockThreshold = selectedVariant?.lowStockThreshold ?? 5;
  const stockMessage =
    !selectedVariant || selectedVariant.stockQuantity < 1
      ? "Out of stock"
      : selectedVariant.stockQuantity <= stockThreshold
        ? `Only ${selectedVariant.stockQuantity} left`
        : "In stock and ready to ship";
  const fitNote = product.modelSizeInfo ?? "Relaxed everyday fit with room to layer comfortably.";
  const productNotes = [
    {
      title: "Fabric & feel",
      body:
        product.description ??
        "Soft-touch materials and clean construction designed for everyday comfort and repeat wear.",
    },
    {
      title: "Fit notes",
      body: fitNote,
    },
    {
      title: "Best for",
      body: `Daily rotation, weekend styling, and elevated ${product.category.name.toLowerCase()} wardrobes.`,
    },
  ];
  const reviewHighlights = [
    {
      label: "Customer rating",
      value: avgRating != null ? `${avgRating.toFixed(1)} / 5` : "New drop",
      helper: avgRating != null ? formatReviewCount(product.reviews.length, "verified") : "Be the first to review it",
    },
    {
      label: "Delivery",
      value: "2-4 days",
      helper: "Express dispatch on in-stock sizes",
    },
    {
      label: "Purchase confidence",
      value: "COD ready",
      helper: "Cash on Delivery Available",
    },
  ];

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stockQuantity < 1) return;
    addItem(product.id, selectedVariant.id, 1);
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-28 lg:pb-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
        <MotionReveal className="space-y-4">
          <div className="group relative aspect-[3/4] overflow-hidden rounded-[1.75rem] bg-muted">
            <AnimatePresence mode="wait">
              <motion.div
                key={mainImageSrc}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.45, ease: premiumEase }}
                className="absolute inset-0"
              >
                <Image
                  src={mainImageSrc}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110 premium-media"
                  priority
                  unoptimized={mainImageSrc.startsWith("/placeholder") || mainImageSrc.startsWith("/demo/")}
                />
              </motion.div>
            </AnimatePresence>
            {onSale && (
              <Badge variant="sale" className="absolute top-3 left-3 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                Sale
              </Badge>
            )}
            {totalStock <= 12 && totalStock > 0 && (
              <Badge className="absolute top-3 right-3 rounded-full bg-amber-500 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-black">
                Selling Fast
              </Badge>
            )}
            <div className="pointer-events-none absolute bottom-3 left-3 hidden rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs text-white backdrop-blur md:inline-flex">
              Hover to zoom
            </div>
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                (() => {
                  const thumbSrc = resolveProductImage({
                    src: img.url,
                    slug: product.slug ?? product.id,
                    name: product.name,
                    index: i,
                  });
                  return (
                <motion.button
                  key={img.id}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  className={cn(
                    "relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-muted transition premium-surface",
                    i === mainImageIndex ? "border-primary shadow-sm" : "border-transparent hover:border-border"
                  )}
                  onClick={() => setMainImageIndex(i)}
                >
                  <Image
                    src={thumbSrc}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized={thumbSrc.startsWith("/placeholder") || thumbSrc.startsWith("/demo/")}
                  />
                </motion.button>
                  );
                })()
              ))}
            </div>
          )}
        </MotionReveal>

        <MotionStagger className="space-y-6" delayChildren={0.05}>
          <MotionItem className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full px-3 py-1 uppercase tracking-[0.18em]">
                {product.category.name}
              </Badge>
              {product.reviews.length > 0 && (
                <Badge className="rounded-full bg-black px-3 py-1 uppercase tracking-[0.18em] text-white">
                  Best Seller
                </Badge>
              )}
            </div>

            <div>
              <h1 className="font-heading text-3xl font-semibold tracking-tight lg:text-4xl">
                {product.name}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                {product.description ??
                  "Minimal. Considered. Built for everyday wear with clean lines and easy layering."}
              </p>
            </div>

            <div className="flex items-end gap-3">
              <span className="text-3xl font-semibold">{formatCurrency(product.price)}</span>
              {onSale && (
                <span className="pb-1 text-base text-muted-foreground line-through">
                  {formatCurrency(product.previousPrice!)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{stockMessage}</span>
              {avgRating != null && <span>★ {avgRating.toFixed(1)} from {formatReviewCount(product.reviews.length)}</span>}
              <span>{totalStock} units across variants</span>
            </div>
          </MotionItem>

          <MotionStagger className="grid gap-3 sm:grid-cols-3" staggerChildren={0.08}>
            {reviewHighlights.map((item) => (
              <MotionItem key={item.label} className="rounded-2xl border bg-muted/30 p-4 premium-surface">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{item.label}</p>
                <p className="mt-2 font-semibold">{item.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.helper}</p>
              </MotionItem>
            ))}
          </MotionStagger>

          <MotionItem className="mt-6">
            <p className="text-sm font-medium">Color</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {colors.map((v) => (
                <motion.button
                  key={v.id}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition premium-surface",
                    selectedColor === v.colorName ? "border-primary ring-2 ring-primary/20" : "border-border"
                  )}
                  style={{ backgroundColor: v.colorHex ?? "#ccc" }}
                  title={v.colorName}
                  onClick={() => setSelectedColor(v.colorName)}
                />
              ))}
            </div>
          </MotionItem>

          <MotionItem className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Size</p>
              <Button variant="ghost" size="sm" className="pressable" onClick={() => setSizeChartOpen(true)}>
                <RulerIcon className="h-4 w-4 mr-1" />
                Size chart
              </Button>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {sizes.map((s) => {
                const variant = product.variants.find((v) => v.size === s && v.colorName === (selectedColor ?? colors[0]?.colorName));
                const outOfStock = !variant || variant.stockQuantity < 1;
                return (
                  <motion.button
                    key={s}
                    type="button"
                    disabled={outOfStock}
                    whileTap={{ scale: outOfStock ? 1 : 0.97 }}
                    className={cn(
                      "h-10 min-w-[44px] rounded-md border px-3 text-sm font-medium transition premium-surface",
                      selectedSize === s || (!selectedSize && s === sizes[0])
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input hover:bg-muted",
                      outOfStock && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </motion.button>
                );
              })}
            </div>
            <Button variant="link" size="sm" className="mt-2 px-0" onClick={() => setSizeToolOpen(true)}>
              Find my size
            </Button>
          </MotionItem>

          {product.modelSizeInfo && (
            <p className="text-sm text-muted-foreground mt-2">{product.modelSizeInfo}</p>
          )}

          <MotionItem className="rounded-[1.5rem] border bg-card p-5 shadow-sm premium-panel">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Selected option</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedColor ?? firstColor) || "Default"} / {(selectedSize ?? firstSize) || "Default size"}
                </p>
              </div>
              <p className={cn("text-sm font-medium", selectedVariant?.stockQuantity ? "text-foreground" : "text-destructive")}>
                {stockMessage}
              </p>
            </div>

            <div className="mt-5 flex gap-2">
              <Button
                size="lg"
                className="pressable h-12 flex-1 premium-surface"
                disabled={!selectedVariant || selectedVariant.stockQuantity < 1}
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="icon-lg"
                className="pressable premium-surface"
                onClick={() => toggleWishlist(product.id)}
                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <HeartIcon className={cn("h-5 w-5", isInWishlist && "fill-red-500 text-red-500")} />
              </Button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border bg-muted/30 p-4 premium-surface">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ShieldCheckIcon className="h-4 w-4 text-primary" />
                  Cash on Delivery Available
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Pay with confidence when your order arrives.</p>
              </div>
              <div className="rounded-2xl border bg-muted/30 p-4 premium-surface">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <TruckIcon className="h-4 w-4 text-primary" />
                  Free delivery on orders over $50
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Fast dispatch on all in-stock sizes and colors.</p>
              </div>
            </div>
          </MotionItem>

          <MotionItem className="space-y-4 border-t pt-8">
            <h2 className="font-semibold">Product notes</h2>
            <div className="space-y-3">
              {productNotes.map((note) => (
                <div key={note.title} className="rounded-2xl border bg-muted/20 p-4 premium-surface">
                  <h3 className="text-sm font-medium">{note.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{note.body}</p>
                </div>
              ))}
            </div>
          </MotionItem>

          <MotionItem className="rounded-2xl border bg-card p-4 premium-panel">
            <details>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium">
              Size guide
              <span className="text-sm text-muted-foreground">Tap to expand</span>
            </summary>
            <div className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Use the size chart to compare your measurements and find the best fit for your everyday rotation.
              </p>
              {Array.isArray(product.sizeChartJson) && product.sizeChartJson.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-left">
                      <tr>
                        <th className="px-4 py-3 font-medium">Size</th>
                        <th className="px-4 py-3 font-medium">Chest</th>
                        <th className="px-4 py-3 font-medium">Waist</th>
                        <th className="px-4 py-3 font-medium">Hip</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(product.sizeChartJson as { size: string; chest?: number; waist?: number; hip?: number }[]).map((row) => (
                        <tr key={row.size} className="border-t">
                          <td className="px-4 py-3 font-medium">{row.size}</td>
                          <td className="px-4 py-3 text-muted-foreground">{row.chest ?? "-"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{row.waist ?? "-"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{row.hip ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Use the “Find my size” tool for a quick recommendation.</p>
              )}
            </div>
            </details>
          </MotionItem>

          <MotionItem className="mt-8 border-t pt-8">
            <h2 className="font-semibold mb-4">Reviews</h2>
            <ReviewForm productId={product.id} />
            {product.reviews.length > 0 && (
              <ul className="space-y-3 mt-6">
                {product.reviews.map((r) => (
                  <li key={r.id} className="text-sm">
                    <span className="font-medium">{r.user.name ?? "Anonymous"}</span>
                    <span className="text-muted-foreground"> ★ {r.rating}</span>
                    {r.comment && <p className="mt-1 text-muted-foreground">{r.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </MotionItem>
        </MotionStagger>
      </div>

      {related.length > 0 && (
        <div className="mt-16 border-t pt-12">
          <h2 className="font-heading text-2xl font-semibold mb-6">Complete the Look</h2>
          <CompleteTheLook products={related} />
        </div>
      )}

      <RecentlyViewed />

      <SizeChartModal
        open={sizeChartOpen}
        onOpenChange={setSizeChartOpen}
        sizeChart={product.sizeChartJson as { size: string; chest?: number; waist?: number; hip?: number }[] | null}
      />
      <SizeRecommendationTool
        open={sizeToolOpen}
        onOpenChange={setSizeToolOpen}
        sizeChart={product.sizeChartJson as { size: string; chest?: number; waist?: number; hip?: number }[] | null}
      />

      <motion.div
        initial={{ y: 32, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: premiumEase, delay: 0.15 }}
        className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-3 backdrop-blur lg:hidden"
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold">{formatCurrency(product.price)}</p>
            <p className="truncate text-xs text-muted-foreground">
              {(selectedColor ?? firstColor) || "Default"} / {(selectedSize ?? firstSize) || "Select size"}
            </p>
          </div>
          <Button
            className="pressable h-11 min-w-[150px] premium-surface"
            disabled={!selectedVariant || selectedVariant.stockQuantity < 1}
            onClick={handleAddToCart}
          >
            {!selectedVariant || selectedVariant.stockQuantity < 1 ? "Unavailable" : "Add to Cart"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
