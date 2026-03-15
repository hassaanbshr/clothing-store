import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json([]);
    }
    const items = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id as string },
      include: { product: { include: { images: true, variants: true } } },
    });
    return NextResponse.json(items.map((i) => i.productId));
  } catch (e) {
    console.error("Wishlist fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const productId = body?.productId;
    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }
    await prisma.wishlistItem.upsert({
      where: {
        userId_productId: { userId: session.user.id as string, productId },
      },
      create: { userId: session.user.id as string, productId },
      update: {},
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Wishlist add error:", e);
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }
    await prisma.wishlistItem.deleteMany({
      where: { userId: session.user.id as string, productId },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Wishlist remove error:", e);
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
