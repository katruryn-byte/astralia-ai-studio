import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { isAuthorized } from "@/lib/auth";
import { getGoogleClient } from "@/lib/google";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_NEGATIVE_PROMPT = [
  "captions",
  "subtitles",
  "written words",
  "watermark",
  "logo",
  "distorted hands",
  "extra fingers",
  "plastic skin",
  "robotic voice",
  "static noise",
  "audio hiss",
  "clipping",
].join(", ");

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      prompt?: string;
      model?: string;
      durationSeconds?: number;
      resolution?: string;
      useAvatar?: boolean;
    };

    const prompt = body.prompt?.trim();
    if (!prompt || prompt.length < 20) {
      return NextResponse.json(
        { error: "Descreva o vídeo com pelo menos 20 caracteres." },
        { status: 400 },
      );
    }

    const ai = getGoogleClient();
    const avatar = body.useAvatar
      ? {
          imageBytes: (
            await readFile(join(process.cwd(), "assets", "avatar-astralia.base64"), "utf8")
          ).trim(),
          mimeType: "image/webp",
        }
      : undefined;

    const operation = await ai.models.generateVideos({
      model: body.model ?? "veo-3.1-fast-generate-preview",
      prompt,
      image: avatar,
      config: {
        numberOfVideos: 1,
        aspectRatio: "9:16",
        durationSeconds: body.durationSeconds ?? 8,
        resolution: body.resolution ?? "720p",
        personGeneration: "allow_adult",
        generateAudio: true,
        enhancePrompt: true,
        negativePrompt: DEFAULT_NEGATIVE_PROMPT,
      },
    });

    if (!operation.name) {
      throw new Error("O Google não retornou o identificador da geração.");
    }

    return NextResponse.json({ operationName: operation.name });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao iniciar o vídeo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
