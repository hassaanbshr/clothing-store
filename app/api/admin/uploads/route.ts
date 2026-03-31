import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireAdminApi, slugify } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    const session = await requireAdminApi();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);
    const folder = typeof formData.get("folder") === "string" ? String(formData.get("folder")) : "products";

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided." }, { status: 400 });
    }

    const uploads = await Promise.all(
      files.map(async (file, index) => {
        if (!file.type.startsWith("image/")) {
          throw new Error("Only image uploads are supported.");
        }
        if (file.size > 6 * 1024 * 1024) {
          throw new Error("Images must be 6MB or smaller.");
        }

        const baseName = file.name.replace(/\.[^.]+$/, "");
        const safeName = slugify(baseName) || `image-${Date.now()}-${index}`;

        const result = await put(`${folder}/${safeName}-${crypto.randomUUID()}`, file, {
          access: "public",
          addRandomSuffix: false,
        });

        return {
          url: result.url,
          pathname: result.pathname,
          contentType: file.type,
        };
      })
    );

    return NextResponse.json({ uploads });
  } catch (error) {
    console.error("Admin upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 }
    );
  }
}
