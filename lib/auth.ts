import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import type { User } from "@prisma/client";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "innovations_session";
const SESSION_DAYS = Number(process.env.AUTH_SESSION_DAYS || 7);

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export type SessionUser = Pick<User, "id" | "name" | "email" | "phone" | "role" | "isActive" | "createdAt">;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: Pick<User, "id" | "email" | "name" | "role">) {
  return new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

async function readToken() {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = await readToken();
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    const user = await db.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user || !user.isActive) return null;
    return user;
  } catch {
    return null;
  }
}

export async function requireUser(nextPath = "/dashboard") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

export async function requireAdmin(nextPath = "/admin") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (user.role !== "ADMIN") redirect("/dashboard?error=forbidden");
  return user;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN";
}

export function isStaff(role: string | undefined) {
  return role === "ADMIN" || role === "AGENT";
}
