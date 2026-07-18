import { GenerateVideosOperation } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";
import { getGoogleClient } from "@/lib/google";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const name = request.nextUrl.searchParams.get("operation");
  if (!name || !name.includes("operations/")) {
    return NextResponse.json({ error: "Operação inválida." }, { status: 400 });
  }

  try {
    const ai = getGoogleClient();
    const operation = new GenerateVideosOperation();
    operation.name = name;

    const current = await ai.operations.getVideosOperation({ operation });
    if (!current.done) {
      return NextResponse.json({ done: false, metadata: current.metadata ?? null });
    }

    if (current.error) {
      return NextResponse.json(
        { done: true, error: "A geração falhou.", details: current.error },
        { status: 502 },
      );
    }

    const generated = current.response?.generatedVideos?.[0]?.video;
    const uri = generated?.uri;
    if (!uri) {
      return NextResponse.json(
        {
          done: true,
          error: current.response?.raiMediaFilteredReasons?.join(" ") || "Vídeo não retornado.",
        },
        { status: 502 },
      );
    }

    const token = Buffer.from(uri, "utf8").toString("base64url");
    return NextResponse.json({
      done: true,
      downloadUrl: `/api/veo/download?token=${token}`,
      mimeType: generated.mimeType ?? "video/mp4",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao consultar o vídeo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
