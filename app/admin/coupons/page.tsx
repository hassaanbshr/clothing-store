import { prisma } from "@/lib/prisma";
import { CouponForm } from "./coupon-form";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight mb-8">
        Coupons
      </h1>
      <CouponForm />
      <div className="border rounded-lg overflow-hidden mt-8">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium">Code</th>
              <th className="text-left p-4 font-medium">Type</th>
              <th className="text-left p-4 font-medium">Value</th>
              <th className="text-left p-4 font-medium">Used</th>
              <th className="text-left p-4 font-medium">Expires</th>
              <th className="text-left p-4 font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-4 font-medium">{c.code}</td>
                <td className="p-4">{c.type}</td>
                <td className="p-4">{c.type === "PERCENTAGE" ? `${c.value}%` : `$${c.value}`}</td>
                <td className="p-4">{c.usedCount}{c.maxUses != null ? ` / ${c.maxUses}` : ""}</td>
                <td className="p-4 text-muted-foreground">
                  {new Date(c.expiresAt).toLocaleDateString()}
                </td>
                <td className="p-4">{c.isActive ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
