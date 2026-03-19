import "dotenv/config";
import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";

const IMAGE_DIR = path.join(process.cwd(), "Product-Images");
const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();

async function uploadImages() {
  if (!token) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN");
  }

  const files = fs.readdirSync(IMAGE_DIR);

  for (const file of files) {
    const filePath = path.join(IMAGE_DIR, file);
    const fileBuffer = fs.readFileSync(filePath);

    const blob = await put(`products/${file}`, fileBuffer, {
      access: "public", // ✅ keep this (since your store is public now)
      allowOverwrite: true,
      token,
    });

    console.log(`✅ Uploaded: ${file}`);
    console.log(`🔗 URL: ${blob.url}\n`);
  }
}

uploadImages().catch(console.error);