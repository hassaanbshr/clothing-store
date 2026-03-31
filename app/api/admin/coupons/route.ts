import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    const session = await requireAdminApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { code, type, value, minOrderAmount, maxUses, expiresAt } = body;
    if (!code || !type || value == null || !expiresAt) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    await prisma.coupon.create({
      data: {
        code: String(code).toUpperCase(),
        type: type === "PERCENTAGE" ? "PERCENTAGE" : "FIXED",
        value,
        minOrderAmount: minOrderAmount ?? null,
        maxUses: maxUses ?? null,
        expiresAt: new Date(expiresAt),
        isActive: true,
      },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Coupon create error:", e);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
