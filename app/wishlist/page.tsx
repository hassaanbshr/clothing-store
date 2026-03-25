"use client";

import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/product/product-grid";
import { useWishlistStore } from "@/store/wishlist";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  previousPrice?: number | null;
  images: { url: string; alt?: string | null }[];
  variants: { id: string; colorName: string; colorHex?: string | null }[];
};

export default function WishlistPage() {
  const productIds = useWishlistStore((s) => s.productIds);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const productIdsKey = productIds.join(",");

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      if (productIds.length === 0) {
        if (!cancelled) {
          setProducts([]);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
      }

      try {
        const results = await Promise.all(
          productIds.slice(0, 20).map((id) =>
            fetch(`/api/products/${id}`).then((r) => (r.ok ? r.json() : null))
          )
        );

        if (!cancelled) {
          setProducts(results.filter(Boolean));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [productIds, productIdsKey]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-semibold tracking-tight mb-8">
        Wishlist
      </h1>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
          <Button asChild>
            <Link href="/shop">Explore products</Link>
          </Button>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
