// =============================================================================
// Next.js Edge Middleware — Server-side /admin/* Route Protection
// Runs before any /admin page is rendered. Validates the httpOnly JWT cookie.
// Unauthenticated requests are redirected to /admin (login form).
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE_NAME = "ga_admin_token";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || "ga_default_jwt_secret_newsportal_globalawaaz_2026_fallback";
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept /admin/* routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  // No token at all
  if (!token) {
    // Already on the /admin login page — let it through so the login form renders
    if (pathname === "/admin") return NextResponse.next();

    // Any deeper admin page → redirect to /admin login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  // Verify the token
  try {
    await jwtVerify(token, getJwtSecret());
    // Valid — inject role header for downstream server components (optional)
    const response = NextResponse.next();
    return response;
  } catch {
    // Expired or tampered token — clear cookie and redirect to login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin";
    loginUrl.search = "";
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(ADMIN_COOKIE_NAME);
    return response;
  }
}

export const config = {
  // Apply to all /admin/* routes (Next.js app router paths)
  matcher: ["/admin/:path*"],
};
