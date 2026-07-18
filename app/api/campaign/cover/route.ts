import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const encoded = await readFile(
    join(process.cwd(), "assets", "capa-seu-signo.base64"),
    "utf8",
  );

  return new NextResponse(Buffer.from(encoded.trim(), "base64"), {
    headers: {
      "Content-Type": "image/webp",
      "Content-Disposition": 'attachment; filename="capa-astralia-seu-signo.webp"',
      "Cache-Control": "public, max-age=86400",
    },
  });
}
