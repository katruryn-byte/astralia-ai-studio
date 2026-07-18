import { NextRequest } from "next/server";

export function isAuthorized(request: NextRequest) {
  const expected = process.env.ASTRALIA_STUDIO_SECRET;
  const received = request.headers.get("x-astralia-secret");

  if (!expected || !received) return false;

  const a = new TextEncoder().encode(expected);
  const b = new TextEncoder().encode(received);
  if (a.length !== b.length) return false;

  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a[index] ^ b[index];
  }

  return result === 0;
}
