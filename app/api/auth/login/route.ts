import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSessionToken, setSessionCookie, verifyPassword } from "@/lib/auth";
import { assertSameOrigin, fromError, getClientIp } from "@/lib/api";
import { loginSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEeO7ZNvF8pY5G0h1T9mYWkqLZfZMDPXo5W";
const IP_LIMIT = Number(process.env.AUTH_LOGIN_IP_LIMIT) > 0 ? Number(process.env.AUTH_LOGIN_IP_LIMIT) : 10;
const EMAIL_LIMIT = Number(process.env.AUTH_LOGIN_EMAIL_LIMIT) > 0 ? Number(process.env.AUTH_LOGIN_EMAIL_LIMIT) : 8;

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const ip = getClientIp(request);
    const ipLimit = rateLimit(`login-ip:${ip}`, IP_LIMIT, 10 * 60_000);
    if (!ipLimit.ok) {
      return NextResponse.json({ error: "Too many sign-in attempts. Please wait 10 minutes." }, { status: 429 });
    }

    const input = loginSchema.parse(await request.json());
    const emailLimit = rateLimit(`login-email:${input.email}`, EMAIL_LIMIT, 10 * 60_000);
    if (!emailLimit.ok) {
      return NextResponse.json({ error: "Too many sign-in attempts for this account. Please wait." }, { status: 429 });
    }

    const user = await db.user.findUnique({ where: { email: input.email } });
    const valid = user
      ? await verifyPassword(input.password, user.passwordHash)
      : await bcrypt.compare(input.password, DUMMY_HASH).then(() => false);

    if (!user || !valid || !user.isActive) {
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
    }

    await setSessionCookie(
      await createSessionToken({ id: user.id, email: user.email, name: user.name, role: user.role }),
    );

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    return fromError(error);
  }
}
