// =============================================================================
// Edge Middleware — Global Awaaz Route Protection
// Protects all `/admin/*` sub-routes:
// - Verifies the cryptographic signature of the `ga_admin_token` JWT cookie.
// - Redirects unauthenticated requests directly to `/admin` (login page).
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE_NAME = "ga_admin_token";

const ALLOWED_ADMIN_ROLES = new Set([
  "super_admin",
  "superadmin",
  "chief_editor",
  "editor",
  "admin",
  "publisher",
  "reporter",
  "author",
  "moderator",
]);

const DEFAULT_JWT_SECRET = "ga_jwt_secret_9fe75be1f1b54f0a_super_secure_editorial_2026_globalawaaz";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept /admin/* routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Always let the root /admin page load so the login form renders
  if (pathname === "/admin" || pathname === "/admin/") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  // If token is missing, redirect to admin login
  if (!token) {
    const loginUrl = new URL("/admin", request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const rawRole = ((payload.role as string) || "").toLowerCase().replace("-", "_").trim();

    if (rawRole && ALLOWED_ADMIN_ROLES.has(rawRole)) {
      const response = NextResponse.next();
      response.headers.set("x-user-role", rawRole);
      if (payload.userId) {
        response.headers.set("x-user-id", String(payload.userId));
      }
      return response;
    }

    // Role not authorized
    const loginUrl = new URL("/admin", request.url);
    return NextResponse.redirect(loginUrl);
  } catch {
    // Token verification failed or expired -> redirect to login
    const loginUrl = new URL("/admin", request.url);
    const response = NextResponse.redirect(loginUrl);
    // Clear invalid cookie
    response.cookies.set(ADMIN_COOKIE_NAME, "", { path: "/", maxAge: 0 });
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
