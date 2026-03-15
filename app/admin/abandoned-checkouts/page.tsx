import { prisma } from "@/lib/prisma";

export default async function AdminAbandonedCheckoutsPage() {
  const abandoned = await prisma.abandonedCheckout.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight mb-8">
        Abandoned checkouts
      </h1>
      {abandoned.length === 0 ? (
        <p className="text-muted-foreground">No abandoned checkouts recorded.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
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
        </div>
      )}
    </div>
  );
}
