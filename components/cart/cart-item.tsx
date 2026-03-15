"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2Icon } from "lucide-react";
import { resolveProductImage } from "@/lib/demo-images";

type CartItemProps = {
  productId: string;
  variantId?: string;
  quantity: number;
  onRemove: () => void;
  onQuantityChange: (quantity: number) => void;
};

export function CartItem({ productId, variantId, quantity, onRemove, onQuantityChange }: CartItemProps) {
  const [product, setProduct] = useState<{ name: string; price: number; image?: string } | null>(null);

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          const variant = data.variants?.find((v: { id: string }) => v.id === variantId);
          const price = variant ? Number(variant.price ?? data.price) : Number(data.price);
          const img = resolveProductImage({
            src: data.images?.[0]?.url,
            slug: data.slug ?? data.id,
            name: data.name,
          });
          setProduct({ name: data.name, price, image: img });
        }
      })
      .catch(() => setProduct(null));
  }, [productId, variantId]);

  if (!product) return <div className="animate-pulse h-20 bg-muted rounded" />;

  return (
    <li className="flex gap-3 border-b pb-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
        <Image
          src={product.image ?? "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover"
          unoptimized={
            (product.image ?? "/placeholder.svg").startsWith("/placeholder") ||
            (product.image ?? "/placeholder.svg").startsWith("/demo/")
          }
        />
      </div>
      <div className="flex-1 min-w-0">
        <Link href={`/product/${productId}`} className="font-medium text-sm truncate block hover:underline">
          {product.name}
        </Link>
        <p className="text-muted-foreground text-sm">${product.price.toFixed(2)}</p>
        <div className="flex items-center gap-2 mt-1">
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => onQuantityChange(parseInt(e.target.value, 10) || 1)}
            className="h-8 w-16 text-center"
          />
          <Button variant="ghost" size="icon-sm" onClick={onRemove} aria-label="Remove">
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </li>
  );
}
