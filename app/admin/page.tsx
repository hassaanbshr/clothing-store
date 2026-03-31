import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminTableShell } from "@/components/admin/admin-table-shell";
import { DashboardRevenueChart } from "@/components/admin/dashboard-revenue-chart";

export default async function AdminDashboardPage() {
  const [orderCount, productCount, lowStockCount, abandonedCount, paidOrders, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.productVariant.count({ where: { stockQuantity: { lte: 5 } } }),
    prisma.abandonedCheckout.count(),
    prisma.order.findMany({
      where: { status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } },
    }),
  ]);

  const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const monthlyData = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const month = date.getMonth();
    const year = date.getFullYear();
    const orders = paidOrders.filter(
      (order) =>
        order.createdAt.getMonth() === month && order.createdAt.getFullYear() === year
    );

    return {
      label: date.toLocaleDateString("en-US", { month: "short" }),
      orders: orders.length,
      revenue: orders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
    };
  });

  return (
    <div>
      <AdminPageHeader
        title="Overview"
        description="Track store health, recent order activity, and catalog risk areas from one place."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Total orders"
          value={String(orderCount)}
          helper="All orders placed in the store."
          trend="Live"
        />
        <AdminStatCard
          label="Total products"
          value={String(productCount)}
          helper="Catalog items currently in the database."
        />
        <AdminStatCard
          label="Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          helper="Calculated from paid, processing, shipped, and delivered orders."
        />
        <AdminStatCard
          label="Attention needed"
          value={String(lowStockCount + abandonedCount)}
          helper={`${lowStockCount} low-stock variants and ${abandonedCount} abandoned checkouts.`}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
        <div className="rounded-[1.5rem] border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Revenue trend</h2>
            <p className="text-sm text-muted-foreground">Last 6 months of completed sales activity.</p>
          </div>
          <DashboardRevenueChart data={monthlyData} />
        </div>

        <AdminTableShell>
          <div className="border-b p-5">
            <h2 className="text-lg font-semibold">Recent orders</h2>
            <p className="text-sm text-muted-foreground">Quick access to the latest fulfillment activity.</p>
          </div>
          <div className="divide-y">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-muted/30"
              >
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">{order.user.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${Number(order.totalAmount).toFixed(2)}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {order.status}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </AdminTableShell>
      </div>
    </div>
  );
}
