import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { assertSameOrigin, fromError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    return fromError(error);
  }
}
