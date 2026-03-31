import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { OrderStatusUpdate } from "../order-status-update";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      shippingAddress: true,
    },
  });

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Order ${order.orderNumber}`}
        description={`Placed on ${new Date(order.createdAt).toLocaleString()}`}
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/orders">Back to orders</Link>
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-[1.5rem] border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Items</h2>
                <p className="text-sm text-muted-foreground">Order contents and variant details.</p>
              </div>
              <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />
            </div>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border p-4">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.variant ? `${item.variant.size} / ${item.variant.colorName}` : "Default variant"} x{" "}
                      {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">${Number(item.priceAtOrder).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Shipping address</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[1.5rem] border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Customer</h2>
            <div className="mt-4 space-y-2 text-sm">
              <p className="font-medium">{order.user.name ?? "Customer"}</p>
              <p className="text-muted-foreground">{order.user.email}</p>
            </div>
          </section>

          <section className="rounded-[1.5rem] border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{order.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-3 text-base font-semibold">
                <span>Total</span>
                <span>${Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
