import { GoogleGenAI } from "@google/genai";

export function getGoogleClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada.");
  return new GoogleGenAI({ apiKey });
}
