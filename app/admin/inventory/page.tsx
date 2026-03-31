import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTableShell } from "@/components/admin/admin-table-shell";
import { InventoryTable } from "@/components/admin/inventory-table";

export default async function AdminInventoryPage() {
  const variants = await prisma.productVariant.findMany({
    include: { product: { select: { name: true } } },
    orderBy: { stockQuantity: "asc" },
  });

  const lowStock = variants.filter((v) => v.stockQuantity <= v.lowStockThreshold);

  return (
    <div>
      <AdminPageHeader
        title="Inventory"
        description="Track live stock levels and quickly spot variants that need replenishment."
      />
      {lowStock.length > 0 && (
        <div className="mb-6 rounded-[1.25rem] border border-amber-500 bg-amber-50 p-4 dark:bg-amber-950/20">
          <p className="font-medium text-amber-800 dark:text-amber-200">
            {lowStock.length} variant(s) with low stock
          </p>
          <p className="mt-1 text-sm text-amber-800/80 dark:text-amber-200/80">
            Update stock counts inline and save each variant without leaving this screen.
          </p>
        </div>
      )}
      <AdminTableShell>
        <InventoryTable
          variants={variants.map((variant) => ({
            id: variant.id,
            productName: variant.product.name,
            sku: variant.sku,
            size: variant.size,
            colorName: variant.colorName,
            stockQuantity: variant.stockQuantity,
            lowStockThreshold: variant.lowStockThreshold,
          }))}
        />
      </AdminTableShell>
    </div>
  );
}
