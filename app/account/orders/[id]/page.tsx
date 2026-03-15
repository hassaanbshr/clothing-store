import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id as string },
    include: {
      items: { include: { product: true, variant: true } },
      shippingAddress: true,
    },
  });

  if (!order) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight mb-2">
        Order {order.orderNumber}
      </h1>
      <p className="text-muted-foreground text-sm mb-6">
        Placed on {new Date(order.createdAt).toLocaleString()}
      </p>
      <p className="capitalize mb-6">
        Status: <span className="font-medium">{order.status.toLowerCase()}</span>
      </p>
      <div className="border rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-2">Shipping address</h2>
        <p>
          {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
          {order.shippingAddress.state} {order.shippingAddress.postalCode},{" "}
          {order.shippingAddress.country}
        </p>
      </div>
      <ul className="space-y-2 mb-6">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between border-b pb-2">
            <span>
              {item.product.name}
              {item.variant ? ` (${item.variant.size} / ${item.variant.colorName})` : ""} ×{" "}
              {item.quantity}
            </span>
            <span>${Number(item.priceAtOrder).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <p className="font-semibold text-lg">
        Total: ${Number(order.totalAmount).toFixed(2)}
      </p>
      <Button variant="outline" asChild className="mt-6">
        <Link href="/account/orders">Back to orders</Link>
      </Button>
    </div>
  );
}
