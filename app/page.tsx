import { HeroBanner } from "@/components/home/hero-banner";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { NewArrivals } from "@/components/home/new-arrivals";
import { BestSellers } from "@/components/home/best-sellers";
import { PromoBanner } from "@/components/home/promo-banner";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getCategories() {
  try {
    return await prisma.category.findMany({ orderBy: { order: "asc" } });
  } catch {
    return [];
  }
}

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 3 },
        variants: true,
      },
      orderBy: { createdAt: "desc" },
      take: 16,
    });
    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      previousPrice: p.previousPrice ? Number(p.previousPrice) : null,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return (
    <>
      <HeroBanner />
      <FeaturedCategories categories={categories} />
      <NewArrivals products={products} />
      <BestSellers products={products} />
      <PromoBanner />
      <NewsletterSection />
    </>
  );
}
