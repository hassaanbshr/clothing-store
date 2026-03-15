import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const name = body?.name;
    if (typeof name !== "string") {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }
    await prisma.user.update({
      where: { id: session.user.id as string },
      data: { name: name.trim() || null },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Profile update error:", e);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
