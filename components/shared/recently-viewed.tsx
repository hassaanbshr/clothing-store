"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUIStore } from "@/store/ui";
import { resolveProductImage } from "@/lib/demo-images";

export function RecentlyViewed() {
  const ids = useUIStore((s) => s.recentlyViewedIds);
  const [products, setProducts] = useState<{ id: string; name: string; price: number; images: { url: string }[] }[]>([]);
  const idsKey = ids.join(",");

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      if (ids.length === 0) {
        if (!cancelled) {
          setProducts([]);
        }
        return;
      }

      const results = await Promise.all(
        ids.slice(0, 6).map((id) =>
          fetch(`/api/products/${id}`).then((r) => (r.ok ? r.json() : null))
        )
      );

      if (!cancelled) {
        setProducts(results.filter(Boolean));
      }
    };

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [ids, idsKey]);

  if (products.length === 0) return null;

  return (
    <section className="border-t pt-8 mt-8">
      <h2 className="font-heading text-xl font-semibold mb-4">Recently viewed</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map((p) => (
          (() => {
            const img = resolveProductImage({
              src: p.images?.[0]?.url,
              slug: p.id,
              name: p.name,
            });
            return (
          <Link
            key={p.id}
            href={`/product/${p.id}`}
            className="shrink-0 w-32 group"
          >
            <div className="relative aspect-[3/4] rounded-lg bg-muted overflow-hidden">
              <Image
                src={img}
                alt={p.name}
                fill
                className="object-cover transition group-hover:scale-105"
                unoptimized={img.startsWith("/placeholder") || img.startsWith("/demo/")}
              />
            </div>
            <p className="font-medium text-sm mt-1 truncate">{p.name}</p>
            <p className="text-xs text-muted-foreground">${p.price?.toFixed(2)}</p>
          </Link>
            );
          })()
        ))}
      </div>
    </section>
  );
}
