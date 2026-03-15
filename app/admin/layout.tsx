import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");
  if ((session.user as { role?: string }).role !== "ADMIN") redirect("/");

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="w-56 border-r bg-muted/30 p-4">
        <nav className="flex flex-col gap-2">
          <Link href="/admin" className="font-medium hover:underline">
            Dashboard
          </Link>
          <Link href="/admin/products" className="text-muted-foreground hover:text-foreground">
            Products
          </Link>
          <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground">
            Orders
          </Link>
          <Link href="/admin/inventory" className="text-muted-foreground hover:text-foreground">
            Inventory
          </Link>
          <Link href="/admin/coupons" className="text-muted-foreground hover:text-foreground">
            Coupons
          </Link>
          <Link href="/admin/abandoned-checkouts" className="text-muted-foreground hover:text-foreground">
            Abandoned checkouts
          </Link>
        </nav>
      </aside>
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
