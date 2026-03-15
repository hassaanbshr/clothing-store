import { prisma } from "@/lib/prisma";

export default async function AdminInventoryPage() {
  const variants = await prisma.productVariant.findMany({
    include: { product: { select: { name: true } } },
    orderBy: { stockQuantity: "asc" },
  });

  const lowStock = variants.filter((v) => v.stockQuantity <= v.lowStockThreshold);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight mb-8">
        Inventory
      </h1>
      {lowStock.length > 0 && (
        <div className="mb-6 p-4 border border-amber-500 rounded-lg bg-amber-50 dark:bg-amber-950/20">
          <p className="font-medium text-amber-800 dark:text-amber-200">
            {lowStock.length} variant(s) with low stock
          </p>
        </div>
      )}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium">Product</th>
              <th className="text-left p-4 font-medium">Size</th>
              <th className="text-left p-4 font-medium">Color</th>
              <th className="text-left p-4 font-medium">Stock</th>
              <th className="text-left p-4 font-medium">Low threshold</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr
                key={v.id}
                className={`border-t ${v.stockQuantity <= v.lowStockThreshold ? "bg-amber-50/50 dark:bg-amber-950/10" : ""}`}
              >
                <td className="p-4">{v.product.name}</td>
                <td className="p-4">{v.size}</td>
                <td className="p-4">{v.colorName}</td>
                <td className="p-4 font-medium">{v.stockQuantity}</td>
                <td className="p-4 text-muted-foreground">{v.lowStockThreshold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
