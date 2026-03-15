import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, sessionId, cartSnapshot, totalValue } = body;
    if (!cartSnapshot || totalValue == null) {
      return NextResponse.json({ error: "cartSnapshot and totalValue required" }, { status: 400 });
    }
    const session = await getServerSession(authOptions);
    await prisma.abandonedCheckout.create({
      data: {
        email: email ?? null,
        sessionId: sessionId ?? null,
        userId: session?.user?.id ?? null,
        cartSnapshot,
        totalValue,
      },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Abandoned checkout create error:", e);
    return NextResponse.json({ error: "Failed to record" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const list = await prisma.abandonedCheckout.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(list);
  } catch (e) {
    console.error("Abandoned checkouts fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
