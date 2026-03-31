import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { singletonKey: "default" },
    });

    return NextResponse.json({
      storeName: settings?.storeName ?? "MARGELLE",
      supportEmail: settings?.supportEmail ?? null,
      supportPhone: settings?.supportPhone ?? null,
      shippingThreshold: settings?.shippingThreshold ? Number(settings.shippingThreshold) : 150,
      currencyCode: settings?.currencyCode ?? "USD",
    });
  } catch (error) {
    console.error("Store settings fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch store settings." }, { status: 500 });
  }
}
