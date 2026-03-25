import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    let email: unknown;
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      email = body?.email;
    } else if (contentType.includes("form")) {
      const formData = await request.formData();
      email = formData.get("email");
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }
    // Stub: in production, persist to DB or send to email service
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
