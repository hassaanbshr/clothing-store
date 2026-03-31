import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "../product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!product) notFound();
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <AdminPageHeader
        title="Edit product"
        description="Update merchandising, media order, variants, and inventory controls."
      />
      <ProductForm
        categories={categories}
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: Number(product.price),
          previousPrice: product.previousPrice ? Number(product.previousPrice) : null,
          categoryId: product.categoryId,
          modelSizeInfo: product.modelSizeInfo,
          sizeChartJson: product.sizeChartJson,
          images: product.images,
          variants: product.variants.map((variant) => ({
            id: variant.id,
            size: variant.size,
            colorName: variant.colorName,
            colorHex: variant.colorHex,
            stockQuantity: variant.stockQuantity,
            lowStockThreshold: variant.lowStockThreshold,
            sku: variant.sku,
          })),
        }}
      />
    </div>
  );
}
