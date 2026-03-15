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

  return (
    <div className="group relative">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
          <Image
            src={img.startsWith("http") ? img : img}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
            unoptimized={img.startsWith("/placeholder") || img.startsWith("/demo/")}
          />
          {onSale && (
            <Badge variant="sale" className="absolute top-2 left-2">
              Sale
            </Badge>
          )}
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="secondary"
              size="icon-sm"
              className="rounded-full"
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
              className="rounded-full"
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
        <div className="mt-3 space-y-1">
          <h3 className="font-medium truncate">{product.name}</h3>
          <div className="flex items-center gap-2">
            {onSale && (
              <span className="text-sm text-muted-foreground line-through">
                ${Number(product.previousPrice).toFixed(2)}
              </span>
            )}
            <span className="font-semibold">${product.price.toFixed(2)}</span>
          </div>
          {product.variants && product.variants.length > 0 && (
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
          )}
        </div>
      </Link>
      <Button
        variant="default"
        size="sm"
        className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.preventDefault();
          const first = product.variants?.[0];
          addItem(product.id, first?.id, 1);
        }}
      >
        Add to Cart
      </Button>
    </div>
  );
}
