import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE_NAME = "ga_admin_token";

const ALLOWED_ADMIN_ROLES = new Set([
  "super_admin",
  "superadmin",
  "chief_editor",
  "editor",
  "admin",
  "reporter",
  "author",
  "moderator",
]);

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  return new TextEncoder().encode(
    secret || "ga_default_jwt_secret_newsportal_globalawaaz_2026_fallback"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept /admin/* routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Always let the root /admin page load so the client component or login form renders
  if (pathname === "/admin") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  // If token is present, verify and validate role
  if (token) {
    try {
      const { payload } = await jwtVerify(token, getJwtSecret());
      const rawRole = ((payload.role as string) || "").toLowerCase().replace("-", "_").trim();

      if (rawRole && ALLOWED_ADMIN_ROLES.has(rawRole)) {
        const response = NextResponse.next();
        response.headers.set("x-user-role", rawRole);
        return response;
      }
    } catch {
      // If token verification fails, allow through so admin/layout.tsx can verify sessionStorage or prompt login
    }
  }

  // Pass through to allow admin/layout.tsx to manage the client-side session guard and role access
  return NextResponse.next();
}

export const config = {
  // Apply to all /admin/* routes (Next.js app router paths)
  matcher: ["/admin/:path*"],
};
