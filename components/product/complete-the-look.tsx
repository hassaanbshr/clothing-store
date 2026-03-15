"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { resolveProductImage } from "@/lib/demo-images";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  previousPrice: number | null;
  images: { url: string }[];
  variants: { id: string }[];
};

export function CompleteTheLook({ products }: { products: Product[] }) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((p) => (
        <div key={p.id} className="group">
          <Link href={`/product/${p.id}`}>
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
              <Image
                src={resolveProductImage({
                  src: p.images[0]?.url,
                  slug: p.slug,
                  name: p.name,
                })}
                alt={p.name}
                fill
                className="object-cover transition group-hover:scale-105"
                unoptimized
              />
            </div>
            <p className="font-medium mt-2 truncate">{p.name}</p>
            <p className="text-sm text-muted-foreground">${p.price.toFixed(2)}</p>
          </Link>
          <Button
            size="sm"
            variant="outline"
            className="mt-2 w-full"
            onClick={() => addItem(p.id, p.variants[0]?.id, 1)}
          >
            Add to Cart
          </Button>
        </div>
      ))}
    </div>
  );
}
