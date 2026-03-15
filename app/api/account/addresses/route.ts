import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { addressSchema } from "@/lib/validations/order";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    await prisma.address.create({
      data: {
        userId: session.user.id as string,
        ...parsed.data,
      },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Address create error:", e);
    return NextResponse.json({ error: "Failed to add address" }, { status: 500 });
  }
}
