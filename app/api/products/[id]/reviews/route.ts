import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations/product";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviews = await prisma.review.findMany({
      where: { productId: id },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(reviews);
  } catch (e) {
    console.error("Reviews fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: productId } = await params;
    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: session.user.id as string,
          productId,
        },
      },
      create: {
        userId: session.user.id as string,
        productId,
        rating: parsed.data.rating,
        comment: parsed.data.comment ?? null,
      },
      update: {
        rating: parsed.data.rating,
        comment: parsed.data.comment ?? null,
      },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Review submit error:", e);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
