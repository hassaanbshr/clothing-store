import { prisma } from "@/lib/prisma";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTableShell } from "@/components/admin/admin-table-shell";

export default async function AdminAbandonedCheckoutsPage() {
  const abandoned = await prisma.abandonedCheckout.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <AdminPageHeader
        title="Abandoned checkouts"
        description="Monitor carts that were started but not converted, and prioritize recovery opportunities."
      />
      {abandoned.length === 0 ? (
        <AdminEmptyState
          title="No abandoned checkouts recorded"
          description="Once shoppers begin checkout without completing payment, those carts will appear here."
        />
      ) : (
        <AdminTableShell>
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Email</th>
                <th className="text-left p-4 font-medium">Total value</th>
                <th className="text-left p-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {abandoned.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="p-4">{a.email ?? "—"}</td>
                  <td className="p-4">${Number(a.totalValue).toFixed(2)}</td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(a.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableShell>
      )}
    </div>
  );
}
