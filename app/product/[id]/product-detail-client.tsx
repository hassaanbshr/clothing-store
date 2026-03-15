"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeartIcon, RulerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import { useUIStore } from "@/store/ui";
import { SizeChartModal } from "@/components/product/size-chart-modal";
import { SizeRecommendationTool } from "@/components/product/size-recommendation-tool";
import { CompleteTheLook } from "@/components/product/complete-the-look";
import { ReviewForm } from "@/components/product/review-form";
import { RecentlyViewed } from "@/components/shared/recently-viewed";
import { resolveProductImage } from "@/lib/demo-images";
import { cn } from "@/lib/utils";

type Variant = {
  id: string;
  size: string;
  colorName: string;
  colorHex?: string | null;
  stockQuantity: number;
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
  const currentImages = selectedVariant
    ? product.images
    : product.images;
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

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stockQuantity < 1) return;
    addItem(product.id, selectedVariant.id, 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
            <Image
              src={mainImageSrc}
              alt={product.name}
              fill
              className="object-cover"
              priority
              unoptimized={mainImageSrc.startsWith("/placeholder") || mainImageSrc.startsWith("/demo/")}
            />
            {onSale && (
              <Badge variant="sale" className="absolute top-2 left-2">
                Sale
              </Badge>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                (() => {
                  const thumbSrc = resolveProductImage({
                    src: img.url,
                    slug: product.slug ?? product.id,
                    name: product.name,
                    index: i,
                  });
                  return (
                <button
                  key={img.id}
                  type="button"
                  className={cn(
                    "relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2",
                    i === mainImageIndex ? "border-primary" : "border-transparent"
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
                </button>
                  );
                })()
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {product.name}
          </h1>
          <p className="text-muted-foreground mt-1">{product.category.name}</p>
          <div className="flex items-center gap-2 mt-4">
            {onSale && (
              <span className="text-muted-foreground line-through">
                ${product.previousPrice!.toFixed(2)}
              </span>
            )}
            <span className="text-xl font-semibold">${product.price.toFixed(2)}</span>
          </div>
          {avgRating != null && (
            <p className="text-sm text-muted-foreground mt-1">
              ★ {avgRating.toFixed(1)} ({product.reviews.length} reviews)
            </p>
          )}

          <div className="mt-6">
            <p className="text-sm font-medium">Color</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {colors.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition",
                    selectedColor === v.colorName ? "border-primary ring-2 ring-primary/20" : "border-border"
                  )}
                  style={{ backgroundColor: v.colorHex ?? "#ccc" }}
                  title={v.colorName}
                  onClick={() => setSelectedColor(v.colorName)}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Size</p>
              <Button variant="ghost" size="sm" onClick={() => setSizeChartOpen(true)}>
                <RulerIcon className="h-4 w-4 mr-1" />
                Size chart
              </Button>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {sizes.map((s) => {
                const variant = product.variants.find((v) => v.size === s && v.colorName === (selectedColor ?? colors[0]?.colorName));
                const outOfStock = !variant || variant.stockQuantity < 1;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={outOfStock}
                    className={cn(
                      "h-10 min-w-[44px] rounded-md border px-3 text-sm font-medium transition",
                      selectedSize === s || (!selectedSize && s === sizes[0])
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input hover:bg-muted",
                      outOfStock && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <Button variant="link" size="sm" className="mt-2 px-0" onClick={() => setSizeToolOpen(true)}>
              Find my size
            </Button>
          </div>

          {product.modelSizeInfo && (
            <p className="text-sm text-muted-foreground mt-2">{product.modelSizeInfo}</p>
          )}

          <div className="flex gap-2 mt-8">
            <Button
              size="lg"
              disabled={!selectedVariant || selectedVariant.stockQuantity < 1}
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
            <Button
              variant="outline"
              size="icon-lg"
              onClick={() => toggleWishlist(product.id)}
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <HeartIcon className={cn("h-5 w-5", isInWishlist && "fill-red-500 text-red-500")} />
            </Button>
          </div>

          {product.description && (
            <div className="mt-8 border-t pt-8">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          <div className="mt-8 border-t pt-8">
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
          </div>
        </div>
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
    </div>
  );
}
