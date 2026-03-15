import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validations/order";

function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { items, shippingAddress, paymentMethod, couponCode } = parsed.data;

    let userId: string | null = null;
    if (session?.user?.id) userId = session.user.id as string;

    if (!userId) {
      return NextResponse.json(
        { error: "Please sign in to place an order" },
        { status: 401 }
      );
    }

    let addressId: string;
    if ("addressId" in shippingAddress && shippingAddress.addressId) {
      const existing = await prisma.address.findFirst({
        where: { id: shippingAddress.addressId, userId },
      });
      if (!existing) {
        return NextResponse.json({ error: "Invalid address" }, { status: 400 });
      }
      addressId = existing.id;
    } else if ("street" in shippingAddress) {
      const addr = await prisma.address.create({
        data: {
          userId,
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state ?? "",
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
        },
      });
      addressId = addr.id;
    } else {
      return NextResponse.json({ error: "Address required" }, { status: 400 });
    }

    let couponId: string | null = null;
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode.toUpperCase(),
          isActive: true,
          expiresAt: { gt: new Date() },
          OR: [{ maxUses: null }, { usedCount: { lt: prisma.coupon.fields.maxUses } }],
        },
      });
      if (coupon) {
        couponId = coupon.id;
        const minOrder = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;
        // discount applied after we have totalAmount
      }
    }

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { variants: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalAmount = 0;
    const orderItems: { productId: string; variantId: string | null; quantity: number; priceAtOrder: number }[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) continue;
      const variant = item.variantId
        ? product.variants.find((v) => v.id === item.variantId)
        : product.variants[0];
      const price = variant ? Number(product.price) : Number(product.price);
      const qty = Math.min(item.quantity, variant?.stockQuantity ?? 0);
      if (qty < 1) continue;
      totalAmount += price * qty;
      orderItems.push({
        productId: product.id,
        variantId: variant?.id ?? null,
        quantity: qty,
        priceAtOrder: price,
      });
    }

    if (orderItems.length === 0) {
      return NextResponse.json({ error: "No valid items" }, { status: 400 });
    }

    if (couponId) {
      const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
      if (coupon) {
        const minOrder = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;
        if (totalAmount >= minOrder) {
          if (coupon.type === "PERCENTAGE") {
            discountAmount = (totalAmount * Number(coupon.value)) / 100;
          } else {
            discountAmount = Math.min(Number(coupon.value), totalAmount);
          }
        }
      }
    }
    totalAmount = Math.max(0, totalAmount - discountAmount);

    const orderNumber = generateOrderNumber();
    const order = await prisma.order.create({
      data: {
        userId,
        orderNumber,
        status: "PENDING",
        shippingAddressId: addressId,
        paymentMethod,
        couponId,
        discountAmount: discountAmount > 0 ? discountAmount : null,
        totalAmount,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    if (couponId) {
      await prisma.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    for (const oi of orderItems) {
      if (oi.variantId) {
        await prisma.productVariant.update({
          where: { id: oi.variantId },
          data: { stockQuantity: { decrement: oi.quantity } },
        });
      }
    }

    return NextResponse.json({ orderId: order.id, orderNumber });
  } catch (e) {
    console.error("Order create error:", e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id as string },
      include: { items: { include: { product: true } }, shippingAddress: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (e) {
    console.error("Orders fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
