import Image from "next/image";
import Link from "next/link";
import { resolveCategoryImage } from "@/lib/demo-images";
import { MotionItem, MotionReveal, MotionStagger } from "@/components/shared/motion";

type Category = { id: string; name: string; slug: string; image?: string | null };

export function FeaturedCategories({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <section className="container mx-auto px-4 py-16">
      <MotionReveal>
        <h2 className="font-heading text-3xl font-semibold tracking-tight mb-8">
          Shop by Category
        </h2>
      </MotionReveal>
      <MotionStagger className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6" staggerChildren={0.1}>
        {categories.map((cat) => (
          <MotionItem key={cat.id}>
            <Link
              href={`/shop?category=${cat.slug}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-muted premium-surface"
            >
              <Image
                src={resolveCategoryImage(cat.slug)}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-108 premium-media"
                sizes="(max-width: 768px) 50vw, 33vw"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent transition-opacity duration-500 group-hover:opacity-95" />
              <div className="absolute inset-0 flex items-end p-6">
                <span className="font-heading text-2xl font-semibold text-white drop-shadow-md">
                  {cat.name}
                </span>
              </div>
            </Link>
          </MotionItem>
        ))}
      </MotionStagger>
    </section>
  );
}
