import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdminPage } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminPage();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/20">
      <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
        <AdminSidebar />
        <div className="flex-1">
          <header className="border-b bg-background/80 px-4 py-4 backdrop-blur lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Admin Dashboard</p>
                <p className="text-sm text-muted-foreground">
                  Signed in as {session.user.name ?? session.user.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild>
                  <Link href="/" target="_blank">
                    View Storefront
                  </Link>
                </Button>
              </div>
            </div>
          </header>
          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
