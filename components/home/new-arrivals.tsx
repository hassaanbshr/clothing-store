import Link from "next/link";
import { ProductGrid } from "@/components/product/product-grid";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  previousPrice?: number | null;
  images: { url: string; alt?: string | null }[];
  variants?: { id: string; colorName: string; colorHex?: string | null }[];
};

export function NewArrivals({ products }: { products: Product[] }) {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-heading text-3xl font-semibold tracking-tight">
          New Arrivals
        </h2>
        <Link
          href="/shop?sort=newest"
          className="text-sm font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          Shop Now →
        </Link>
      </div>
      <ProductGrid products={products.slice(0, 8)} />
    </section>
  );
}
