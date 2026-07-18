import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const encoded = await readFile(
    join(process.cwd(), "assets", "avatar-astralia.base64"),
    "utf8",
  );

  return new NextResponse(Buffer.from(encoded.trim(), "base64"), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
