import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id as string },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight mb-6">
        Order history
      </h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">You have no orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <div>
                <p className="font-medium">{order.orderNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()} · {order.items.length} item(s) · $
                  {Number(order.totalAmount).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm capitalize bg-muted px-2 py-1 rounded">
                  {order.status.toLowerCase()}
                </span>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/account/orders/${order.id}`}>View</Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
