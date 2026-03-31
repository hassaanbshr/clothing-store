import { HeroBanner } from "@/components/home/hero-banner";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { NewArrivals } from "@/components/home/new-arrivals";
import { BestSellers } from "@/components/home/best-sellers";
import { PromoBanner } from "@/components/home/promo-banner";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const HOME_SECTION_LIMIT = 4;
const NEW_ARRIVAL_WINDOW_MS = 1000 * 60 * 60 * 24 * 45;

async function getCategories() {
  try {
    return await prisma.category.findMany({ orderBy: { order: "asc" } });
  } catch {
    return [];
  }
}

function serializeHomeProducts<T extends {
  price: { toString(): string };
  previousPrice: { toString(): string } | null;
  createdAt: Date;
  variants: { stockQuantity: number }[];
  _count: { reviews: number };
}>(products: T[]) {
  return products.map((product) => ({
    ...product,
    price: Number(product.price),
    previousPrice: product.previousPrice ? Number(product.previousPrice) : null,
    createdAt: product.createdAt.toISOString(),
    isNewArrival: Date.now() - product.createdAt.getTime() <= NEW_ARRIVAL_WINDOW_MS,
    reviewCount: product._count.reviews,
    totalStock: product.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0),
  }));
}

async function getNewArrivals() {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 3 },
        variants: true,
        _count: { select: { reviews: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: HOME_SECTION_LIMIT,
    });

    return serializeHomeProducts(products);
  } catch {
    return [];
  }
}

async function getBestSellers(excludedIds: string[]) {
  try {
    const products = await prisma.product.findMany({
      where: excludedIds.length > 0 ? { id: { notIn: excludedIds } } : undefined,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 3 },
        variants: true,
        _count: { select: { reviews: true } },
      },
      orderBy: [{ orderItems: { _count: "desc" } }, { createdAt: "desc" }],
      take: HOME_SECTION_LIMIT,
    });

    return serializeHomeProducts(products);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [categories, newArrivals] = await Promise.all([
    getCategories(),
    getNewArrivals(),
  ]);
  const bestSellers = await getBestSellers(newArrivals.map((product) => product.id));

  return (
    <>
      <HeroBanner />
      <FeaturedCategories categories={categories} />
      <NewArrivals products={newArrivals} />
      <BestSellers products={bestSellers} />
      <PromoBanner />
      <NewsletterSection />
    </>
  );
}
