"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWishlistStore } from "@/store/wishlist";
import { useUIStore } from "@/store/ui";
import { useCartStore } from "@/store/cart";
import { resolveProductImage } from "@/lib/demo-images";
import { cn } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  reviewCount?: number;
  totalStock?: number;
  createdAt?: string;
  previousPrice?: number | null;
  images: { url: string; alt?: string | null }[];
  variants?: { id: string; colorName: string; colorHex?: string | null }[];
};

export function ProductCard({ product }: { product: Product }) {
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isInWishlist = useWishlistStore((s) => s.has(product.id));
  const openQuickView = useUIStore((s) => s.openQuickView);
  const addItem = useCartStore((s) => s.addItem);

  const img = resolveProductImage({
    src: product.images?.[0]?.url,
    slug: product.slug,
    name: product.name,
  });
  const onSale = product.previousPrice != null && product.previousPrice > product.price;
  const totalStock = product.totalStock ?? 0;
  const isSellingFast = totalStock > 0 && totalStock <= 12;
  const isBestSeller = (product.reviewCount ?? 0) >= 1;
  const isNewArrival =
    product.createdAt != null &&
    Date.now() - new Date(product.createdAt).getTime() <= 1000 * 60 * 60 * 24 * 45;

  return (
    <div className="group relative overflow-hidden rounded-3xl border bg-card p-2 shadow-sm transition-shadow hover:shadow-lg">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[1.25rem] bg-muted">
          <Image
            src={img.startsWith("http") ? img : img}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
            unoptimized={img.startsWith("/placeholder") || img.startsWith("/demo/")}
          />
          <div className="absolute inset-x-2 top-2 flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {onSale && (
                <Badge variant="sale" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                  Sale
                </Badge>
              )}
              {!onSale && isNewArrival && (
                <Badge variant="new" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                  New
                </Badge>
              )}
              {isBestSeller && (
                <Badge className="rounded-full bg-black/75 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white">
                  Best Seller
                </Badge>
              )}
              {!isBestSeller && isSellingFast && (
                <Badge className="rounded-full bg-amber-500 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-black">
                  Selling Fast
                </Badge>
              )}
            </div>

            <div className="flex flex-col gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
            <Button
              variant="secondary"
              size="icon-sm"
              className="rounded-full bg-background/90 backdrop-blur"
              onClick={(e) => {
                e.preventDefault();
                openQuickView(product.id);
              }}
              aria-label="Quick view"
            >
              <EyeIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon-sm"
              className="rounded-full bg-background/90 backdrop-blur"
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(product.id);
              }}
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <HeartIcon
                className={cn("h-4 w-4", isInWishlist && "fill-red-500 text-red-500")}
              />
            </Button>
          </div>
          </div>
        </div>
        <div className="mt-4 space-y-2 px-1 pb-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-medium">{product.name}</h3>
              {isSellingFast ? (
                <p className="mt-1 text-xs text-amber-600">Only {totalStock} left in stock</p>
              ) : isBestSeller ? (
                <p className="mt-1 text-xs text-muted-foreground">{product.reviewCount} customer reviews</p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">Designed for effortless daily wear</p>
              )}
            </div>
            <div className="text-right">
              {onSale && (
                <span className="block text-xs text-muted-foreground line-through">
                  ${Number(product.previousPrice).toFixed(2)}
                </span>
              )}
              <span className="font-semibold">${product.price.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            {product.variants && product.variants.length > 0 ? (
              <div className="flex gap-1 flex-wrap">
                {[...new Map(product.variants.map((v) => [v.colorName, v])).values()]
                  .slice(0, 4)
                  .map((v) => (
                    <span
                      key={v.id}
                      className="inline-block h-3 w-3 rounded-full border border-border"
                      style={{ backgroundColor: v.colorHex ?? "#ccc" }}
                      title={v.colorName}
                    />
                  ))}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Core essential</span>
            )}
            {isBestSeller && <span className="text-xs font-medium text-muted-foreground">Top rated</span>}
          </div>
        </div>
      </Link>
      <div className="px-1 pb-1">
        <Button
          variant="default"
          size="sm"
          className="mt-2 h-10 w-full rounded-2xl"
          onClick={(e) => {
            e.preventDefault();
            const first = product.variants?.[0];
            addItem(product.id, first?.id, 1);
          }}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
