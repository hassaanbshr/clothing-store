import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressForm } from "@/components/account/address-form";

export default async function AddressesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id as string },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight mb-6">
        Saved addresses
      </h1>
      <AddressForm />
      <ul className="mt-8 space-y-4">
        {addresses.map((addr) => (
          <li key={addr.id} className="border rounded-lg p-4">
            <p className="font-medium">{addr.label ?? "Address"}</p>
            <p className="text-sm text-muted-foreground">
              {addr.street}, {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
