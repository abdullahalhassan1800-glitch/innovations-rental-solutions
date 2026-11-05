import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { ApiError, assertSameOrigin, fromError, getClientIp } from "@/lib/api";
import { registerSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const ip = getClientIp(request);
    const limit = rateLimit(`register:${ip}`, 5, 10 * 60_000);
    if (!limit.ok) {
      return NextResponse.json({ error: "Too many accounts created from this network. Try again later." }, { status: 429 });
    }

    const body = await request.json();
    const input = registerSchema.parse(body);

    const existing = await db.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ApiError("An account with this email already exists", 409, "EMAIL_TAKEN");

    const user = await db.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        passwordHash: await hashPassword(input.password),
        role: "USER",
      },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });

    await setSessionCookie(await createSessionToken(user));
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return fromError(error);
  }
}
