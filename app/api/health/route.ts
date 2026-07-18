import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    providers: {
      veo: Boolean(process.env.GEMINI_API_KEY),
      runway: Boolean(process.env.RUNWAYML_API_SECRET),
    },
  });
}
