import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTableShell } from "@/components/admin/admin-table-shell";
import { OrderStatusUpdate } from "./order-status-update";

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q?.trim();
  const status = params.status?.trim();

  const orders = await prisma.order.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { orderNumber: { contains: q, mode: "insensitive" } },
              { user: { email: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(status ? { status: status as OrderStatus } : {}),
    },
    include: {
      user: { select: { email: true, name: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        description="Search order activity, review customer details, and update fulfillment states."
      />

      <form className="mb-6 grid gap-3 rounded-[1.5rem] border bg-card p-4 shadow-sm md:grid-cols-[1fr_220px_auto]">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by order number or customer email"
          className="h-8 rounded-md border border-input bg-background px-3 text-sm"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-8 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <Button type="submit" variant="outline">
          Apply filters
        </Button>
      </form>

      {orders.length === 0 ? (
        <AdminEmptyState
          title="No orders found"
          description="Try a different search term or status filter."
        />
      ) : (
        <AdminTableShell>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="p-4 text-left font-medium">Order #</th>
                  <th className="p-4 text-left font-medium">Customer</th>
                  <th className="p-4 text-left font-medium">Items</th>
                  <th className="p-4 text-left font-medium">Total</th>
                  <th className="p-4 text-left font-medium">Status</th>
                  <th className="p-4 text-left font-medium">Date</th>
                  <th className="p-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="p-4 font-medium">{order.orderNumber}</td>
                    <td className="p-4">
                      <div>{order.user.name ?? order.user.email}</div>
                      <div className="text-xs text-muted-foreground">{order.user.email}</div>
                    </td>
                    <td className="p-4">{order.items.length}</td>
                    <td className="p-4">${Number(order.totalAmount).toFixed(2)}</td>
                    <td className="p-4">
                      <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/orders/${order.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminTableShell>
      )}
    </div>
  );
}
