import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";

export type AdminNavItem = {
  href: string;
  label: string;
  description: string;
};

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Overview", description: "Store KPIs and trends" },
  { href: "/admin/products", label: "Products", description: "Catalog and merchandising" },
  { href: "/admin/categories", label: "Categories", description: "Collection structure" },
  { href: "/admin/orders", label: "Orders", description: "Fulfillment and status" },
  { href: "/admin/inventory", label: "Inventory", description: "Stock and low-stock alerts" },
  { href: "/admin/coupons", label: "Coupons", description: "Discount campaigns" },
  { href: "/admin/abandoned-checkouts", label: "Recovery", description: "Abandoned carts" },
  { href: "/admin/settings", label: "Settings", description: "Store basics" },
];

export function isAdminRole(role?: string | null) {
  return role === "ADMIN";
}

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  return session && isAdminRole(session.user?.role) ? session : null;
}

export async function requireAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/admin");
  }

  if (!isAdminRole(session.user.role)) {
    redirect("/");
  }

  return session as Session;
}

export async function requireAdminApi() {
  const session = await getServerSession(authOptions);
  return session?.user && isAdminRole(session.user.role) ? session : null;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
