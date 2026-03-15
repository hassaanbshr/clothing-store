import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { couponValidateSchema } from "@/lib/validations/order";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = couponValidateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { code, orderAmount } = parsed.data;

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        expiresAt: { gt: new Date() },
        OR: [{ maxUses: null }, { usedCount: { lt: prisma.coupon.fields.maxUses } }],
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 400 });
    }

    const minOrder = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;
    if (orderAmount < minOrder) {
      return NextResponse.json(
        { error: `Minimum order amount is $${minOrder.toFixed(2)}` },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.type === "PERCENTAGE") {
      discount = (orderAmount * Number(coupon.value)) / 100;
    } else {
      discount = Math.min(Number(coupon.value), orderAmount);
    }

    return NextResponse.json({ discount, code: coupon.code });
  } catch (e) {
    console.error("Coupon validate error:", e);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
