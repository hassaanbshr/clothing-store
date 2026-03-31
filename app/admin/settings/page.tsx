import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";

export default async function AdminSettingsPage() {
  const settings = await prisma.storeSettings.findUnique({
    where: { singletonKey: "default" },
  });

  return (
    <div>
      <AdminPageHeader
        title="Store settings"
        description="Manage the basic values that shape your storefront messaging and checkout thresholds."
      />
      <StoreSettingsForm
        settings={{
          storeName: settings?.storeName ?? "MARGELLE",
          supportEmail: settings?.supportEmail ?? null,
          supportPhone: settings?.supportPhone ?? null,
          shippingThreshold: settings?.shippingThreshold ? Number(settings.shippingThreshold) : null,
          currencyCode: settings?.currencyCode ?? "USD",
        }}
      />
    </div>
  );
}
