import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(categories);
  } catch (e) {
    console.error("Categories fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
