import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [orderCount, productCount, lowStockCount, abandonedCount] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.productVariant.count({ where: { stockQuantity: { lte: 5 } } }),
    prisma.abandonedCheckout.count(),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight mb-8">
        Admin Dashboard
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-muted-foreground text-sm">Total orders</p>
          <p className="text-2xl font-semibold">{orderCount}</p>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">
            View
          </Link>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-muted-foreground text-sm">Products</p>
          <p className="text-2xl font-semibold">{productCount}</p>
          <Link href="/admin/products" className="text-sm text-primary hover:underline">
            Manage
          </Link>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-muted-foreground text-sm">Low stock variants</p>
          <p className="text-2xl font-semibold">{lowStockCount}</p>
          <Link href="/admin/inventory" className="text-sm text-primary hover:underline">
            View
          </Link>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-muted-foreground text-sm">Abandoned checkouts</p>
          <p className="text-2xl font-semibold">{abandonedCount}</p>
          <Link href="/admin/abandoned-checkouts" className="text-sm text-primary hover:underline">
            View
          </Link>
        </div>
      </div>
    </div>
  );
}
