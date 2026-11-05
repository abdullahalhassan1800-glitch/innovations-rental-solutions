import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  ACCESS_QUERY_PARAM,
  MAX_COOKIE_AGE,
  verifyAccessToken,
} from "@/lib/share-access";

export const dynamic = "force-dynamic";

function safeNext(value: string | null) {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  return value;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get(ACCESS_QUERY_PARAM);
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const state = await verifyAccessToken(token);

  if (!state || state.expired) {
    const expired = new URL("/locked", request.url);
    expired.searchParams.set("reason", state?.expired ? "expired" : "invalid");
    const response = NextResponse.redirect(expired);
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  const remaining = state.expiresAt - Math.floor(Date.now() / 1000);
  const response = NextResponse.redirect(new URL(next, request.url));
  response.cookies.set(ACCESS_COOKIE, token as string, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.max(60, Math.min(remaining, MAX_COOKIE_AGE)),
  });
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
