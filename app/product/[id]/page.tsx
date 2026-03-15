import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "./product-detail-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { name: true, description: true },
  });
  if (!product) return { title: "Product" };
  return {
    title: `${product.name} | MARGELLE`,
    description: product.description?.slice(0, 160) ?? undefined,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      category: true,
      reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: true,
    },
    take: 4,
  });

  const serialized = {
    ...product,
    price: Number(product.price),
    previousPrice: product.previousPrice ? Number(product.previousPrice) : null,
    reviews: product.reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
    })),
  };
  const relatedSerialized = related.map((p) => ({
    ...p,
    price: Number(p.price),
    previousPrice: p.previousPrice ? Number(p.previousPrice) : null,
  }));

  return (
    <ProductDetailClient
      product={serialized}
      related={relatedSerialized}
    />
  );
}
