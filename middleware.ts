import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "innovations_session";

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

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return loginRedirect(request);

  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    const isAdminArea = request.nextUrl.pathname.startsWith("/admin");

    if (isAdminArea && payload.role !== "ADMIN") {
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
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
