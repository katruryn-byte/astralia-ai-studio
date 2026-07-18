import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const token = request.nextUrl.searchParams.get("token");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!token || !apiKey) {
    return NextResponse.json({ error: "Download indisponível." }, { status: 400 });
  }

  try {
    const uri = Buffer.from(token, "base64url").toString("utf8");
    const url = new URL(uri);
    const allowed =
      url.protocol === "https:" &&
      (url.hostname === "generativelanguage.googleapis.com" ||
        url.hostname.endsWith(".googleapis.com"));

    if (!allowed) {
      return NextResponse.json({ error: "Origem de vídeo inválida." }, { status: 400 });
    }

    url.searchParams.set("key", apiKey);
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok || !response.body) {
      throw new Error(`Google respondeu ${response.status}.`);
    }

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "video/mp4",
        "Content-Disposition": 'attachment; filename="astralia-reel.mp4"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha no download.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
