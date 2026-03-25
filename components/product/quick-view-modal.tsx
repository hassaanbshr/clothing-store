"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui";
import { useCartStore } from "@/store/cart";
import { resolveProductImage } from "@/lib/demo-images";

export function QuickViewModal() {
  const productId = useUIStore((s) => s.quickViewProductId);
  const closeQuickView = useUIStore((s) => s.closeQuickView);
  const addItem = useCartStore((s) => s.addItem);
  const [product, setProduct] = useState<{
    id: string;
    name: string;
    price: number;
    previousPrice?: number | null;
    images: { url: string }[];
    variants: { id: string; size: string; colorName: string; stockQuantity: number }[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      if (!productId) {
        if (!cancelled) {
          setProduct(null);
        }
        return;
      }

      try {
        const nextProduct = await fetch(`/api/products/${productId}`).then((r) => (r.ok ? r.json() : null));
        if (!cancelled) {
          setProduct(nextProduct);
        }
      } catch {
        if (!cancelled) {
          setProduct(null);
        }
      }
    };

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const open = !!productId;
  const firstVariant = product?.variants?.[0];
  const previewImage = resolveProductImage({
    src: product?.images[0]?.url,
    name: product?.name,
    slug: product?.id,
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeQuickView()}>
      <DialogContent className="max-w-lg">
        {product && (
          <>
            <DialogHeader>
              <DialogTitle className="sr-only">{product.name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative aspect-[3/4] rounded-lg bg-muted overflow-hidden">
                <Image
                  src={previewImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized={previewImage.startsWith("/placeholder") || previewImage.startsWith("/demo/")}
                />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  {product.previousPrice != null && product.previousPrice > product.price && (
                    <span className="text-muted-foreground line-through text-sm">
                      ${product.previousPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="font-semibold">${product.price.toFixed(2)}</span>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button
                    onClick={() => {
                      if (firstVariant && firstVariant.stockQuantity > 0) {
                        addItem(product.id, firstVariant.id, 1);
                        closeQuickView();
                      }
                    }}
                    disabled={!firstVariant || firstVariant.stockQuantity < 1}
                  >
                    Add to Cart
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/product/${product.id}`} onClick={() => closeQuickView()}>
                      View full details
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
