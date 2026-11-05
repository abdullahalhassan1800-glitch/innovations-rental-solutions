import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { ACCESS_COOKIE, verifyAccessToken } from "@/lib/share-access";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "innovations_session";

/**
 * `locked` puts the whole site behind a time-limited access link. Anything other
 * than the exact string `locked` keeps the site public, which is the safe
 * default for local development and for a misconfigured deployment.
 */
const ACCESS_MODE = process.env.SITE_ACCESS_MODE === "locked" ? "locked" : "public";

/** Routes the access gate must never intercept. */
const ALWAYS_ALLOWED = new Set(["/access", "/locked"]);

/** Asset and API trees that never need the access cookie. */
const ALLOWED_PREFIXES = ["/api/", "/_next/", "/_vercel/", "/images/", "/videos/", "/storage/"];

/** Root-level files emitted by Next.js or placed in `public/`. */
const ALLOWED_FILES = new Set([
  "/favicon.ico",
  "/icon.png",
  "/apple-icon.png",
  "/manifest.webmanifest",
  "/robots.txt",
]);

function isAlwaysAllowed(pathname: string) {
  if (ALWAYS_ALLOWED.has(pathname) || ALLOWED_FILES.has(pathname)) return true;
  return ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

function loginRedirect(request: NextRequest) {
  const url = new URL("/login", request.url);
  url.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  const response = NextResponse.redirect(url);
  response.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return response;
}

function lockedRedirect(request: NextRequest) {
  const url = new URL("/locked", request.url);
  if (request.nextUrl.pathname !== "/") {
    url.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  }
  const response = NextResponse.redirect(url);
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

async function hasAccess(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const state = await verifyAccessToken(token);
  return Boolean(state && !state.expired);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAlwaysAllowed(pathname)) return NextResponse.next();

  if (ACCESS_MODE === "locked" && !(await hasAccess(request))) {
    return lockedRedirect(request);
  }

  const needsAccount = pathname.startsWith("/admin") || pathname.startsWith("/dashboard");
  if (!needsAccount) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return loginRedirect(request);

  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });

    if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
      const url = new URL("/dashboard", request.url);
      url.searchParams.set("error", "forbidden");
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    return loginRedirect(request);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|images/|videos/|storage/|favicon.ico|icon.png|apple-icon.png|manifest.webmanifest|_vercel/).*)",
  ],
};
