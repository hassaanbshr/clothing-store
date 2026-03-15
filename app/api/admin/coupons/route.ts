import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
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
