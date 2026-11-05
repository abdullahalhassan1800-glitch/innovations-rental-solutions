import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentUser, type SessionUser } from "./auth";

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status = 400, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function apiError(message: string, status = 400, code?: string) {
  return NextResponse.json({ error: message, code }, { status });
}

export function fromError(error: unknown) {
  if (error instanceof ApiError) {
    return apiError(error.message, error.status, error.code);
  }
  if (error instanceof ZodError) {
    const first = error.issues[0];
    return NextResponse.json(
      {
        error: first?.message || "Please check the submitted details",
        issues: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      },
      { status: 422 },
    );
  }
  console.error("[api]", error);
  return apiError("Something went wrong. Please try again.", 500);
}

export async function requireApiUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new ApiError("Please sign in to continue", 401, "UNAUTHENTICATED");
  return user;
}

export async function requireApiAdmin(): Promise<SessionUser> {
  const user = await requireApiUser();
  if (user.role !== "ADMIN") throw new ApiError("You do not have permission to do that", 403, "FORBIDDEN");
  return user;
}

export async function requireApiStaff(): Promise<SessionUser> {
  const user = await requireApiUser();
  if (user.role !== "ADMIN" && user.role !== "AGENT") {
    throw new ApiError("You do not have permission to do that", 403, "FORBIDDEN");
  }
  return user;
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Basic same-origin guard for cookie-authenticated mutating requests.
 * Complements SameSite=Lax cookies; not a replacement for CSRF tokens.
 */
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const host = request.headers.get("host");
  try {
    const originHost = new URL(origin).host;
    if (host && originHost !== host) {
      throw new ApiError("Invalid request origin", 403, "BAD_ORIGIN");
    }
  } catch {
    throw new ApiError("Invalid request origin", 403, "BAD_ORIGIN");
  }
}

export function parseJsonBody<T>(value: T) {
  return value;
}
