import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return (
    <div>
      <AdminPageHeader
        title="Add product"
        description="Create a new catalog item with pricing, variants, media, and merchandising details."
      />
      <ProductForm categories={categories} />
    </div>
  );
}
