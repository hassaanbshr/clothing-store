import { prisma } from "@/lib/prisma";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight mb-8">
        Add product
      </h1>
      <ProductForm categories={categories} />
    </div>
  );
}
