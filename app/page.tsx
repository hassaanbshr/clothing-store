import { HeroBanner } from "@/components/home/hero-banner";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { NewArrivals } from "@/components/home/new-arrivals";
import { BestSellers } from "@/components/home/best-sellers";
import { PromoBanner } from "@/components/home/promo-banner";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const NEW_ARRIVAL_WINDOW_MS = 1000 * 60 * 60 * 24 * 45;

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
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 16,
    });
    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      previousPrice: p.previousPrice ? Number(p.previousPrice) : null,
      createdAt: p.createdAt.toISOString(),
      isNewArrival: Date.now() - p.createdAt.getTime() <= NEW_ARRIVAL_WINDOW_MS,
      reviewCount: p._count.reviews,
      totalStock: p.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0),
    }));
  } catch {
    return [];
  }
}

async function getBestSellers() {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 3 },
        variants: true,
        _count: { select: { reviews: true } },
      },
      orderBy: { reviews: { _count: "desc" } },
      take: 8,
    });
    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      previousPrice: p.previousPrice ? Number(p.previousPrice) : null,
      createdAt: p.createdAt.toISOString(),
      isNewArrival: Date.now() - p.createdAt.getTime() <= NEW_ARRIVAL_WINDOW_MS,
      reviewCount: p._count.reviews,
      totalStock: p.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0),
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [categories, products, bestSellers] = await Promise.all([
    getCategories(),
    getProducts(),
    getBestSellers(),
  ]);

  return (
    <>
      <HeroBanner />
      <FeaturedCategories categories={categories} />
      <NewArrivals products={products} />
      <BestSellers products={bestSellers.length > 0 ? bestSellers : products} />
      <PromoBanner />
      <NewsletterSection />
    </>
  );
}
