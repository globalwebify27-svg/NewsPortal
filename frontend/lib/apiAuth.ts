// =============================================================================
// API Auth Guard — requireAdminAuth()
// Call at the top of any API route that requires admin authentication.
// Reads the httpOnly ga_admin_token cookie or Authorization Bearer header.
// Validates against MySQL to guarantee:
// 1. Session revocation & expiration are enforced immediately.
// 2. Inactive/suspended accounts are blocked immediately.
// 3. Temporary password changes are enforced.
// 4. Fail-closed security: Database downtime returns 503, NEVER bypasses auth.
// 5. CSRF origin verification on state-changing cookie requests.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";
import { verifyAdminToken, ADMIN_COOKIE_NAME, type AdminTokenPayload } from "./auth";

export type AuthSuccess = {
  ok: true;
  payload: AdminTokenPayload & { userId: string; email: string };
  response?: never;
};

export type AuthFailure = {
  ok: false;
  response: NextResponse;
  payload?: never;
};

export type AuthResult = AuthSuccess | AuthFailure;

/**
 * Validate Origin/Referer header on state-changing requests authenticated via cookie.
 */
function validateCsrfOrigin(req: NextRequest): boolean {
  const method = req.method.toUpperCase();
  // Safe read-only HTTP methods
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return true;
  }

  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");

  if (!origin && !referer) {
    // If neither origin nor referer is provided on a state-changing request, allow in test or development
    return process.env.NODE_ENV !== "production";
  }

  const targetUrl = origin || referer;
  if (!targetUrl || !host) return true;

  try {
    const parsed = new URL(targetUrl);
    // Origin host must match Host or Forwarded-Host
    return (
      parsed.host.toLowerCase() === host.toLowerCase() ||
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname.endsWith(".globalawaaz.com") ||
      parsed.hostname === "globalawaaz.com"
    );
  } catch {
    return false;
  }
}

/**
 * Verify the admin session on any incoming API request.
 * Strictly verifies against MySQL database state (Fail-Closed).
 */
export async function requireAdminAuth(
  req: NextRequest
): Promise<AuthResult> {
  let cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!cookieToken) {
    const rawCookie = req.headers.get("cookie");
    if (rawCookie) {
      const match = rawCookie.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]+)`));
      if (match) cookieToken = match[1];
    }
  }

  const isCookieAuth = Boolean(cookieToken);
  let token = cookieToken;

  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Authentication required. Please log in to the admin panel." },
        { status: 401 }
      ),
    };
  }

  // CSRF validation for cookie-authenticated mutating requests
  if (isCookieAuth && !validateCsrfOrigin(req)) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Cross-site request validation failed (CSRF protection)." },
        { status: 403 }
      ),
    };
  }

  const payload = await verifyAdminToken(token);
  if (!payload) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Invalid or expired session token. Please log in again." },
        { status: 401 }
      ),
    };
  }

  // Strict verification against MySQL database
  try {
    const dbUser = payload.userId
      ? await prisma.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            mustChangePassword: true,
          },
        })
      : await prisma.user.findFirst({
          where: {
            OR: [
              ...(payload.email ? [{ email: payload.email }] : []),
              { name: payload.name },
            ],
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            mustChangePassword: true,
          },
        });

    if (!dbUser) {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, message: "User account not found. Access denied." },
          { status: 401 }
        ),
      };
    }

    if (dbUser.isActive === false) {
      return {
        ok: false,
        response: NextResponse.json(
          { success: false, message: "Your staff account has been deactivated. Contact an administrator." },
          { status: 403 }
        ),
      };
    }

    // ── Session Revocation & Expiration Check ──────────────────────────────
    let activeSession = null;
    if (payload.sessionId) {
      activeSession = await prisma.session.findUnique({
        where: { id: payload.sessionId },
      });
    } else if (token) {
      activeSession = await prisma.session.findFirst({
        where: { token },
      });
    }

    if (activeSession) {
      if (activeSession.isRevoked) {
        return {
          ok: false,
          response: NextResponse.json(
            { success: false, message: "Session has been revoked. Please log in again." },
            { status: 401 }
          ),
        };
      }
      if (activeSession.expiresAt && activeSession.expiresAt < new Date()) {
        return {
          ok: false,
          response: NextResponse.json(
            { success: false, message: "Session has expired. Please log in again." },
            { status: 401 }
          ),
        };
      }
      if (activeSession.userId !== dbUser.id) {
        return {
          ok: false,
          response: NextResponse.json(
            { success: false, message: "Session user mismatch." },
            { status: 401 }
          ),
        };
      }
    }

    // ── Temporary Password Change Enforcement ──────────────────────────────
    const pathname = req.nextUrl?.pathname || "";
    const isPasswordChangeOrLogout =
      pathname.includes("/auth/change-password") ||
      pathname.includes("/auth/logout") ||
      pathname.includes("/auth/login");

    if (dbUser.mustChangePassword && !isPasswordChangeOrLogout) {
      return {
        ok: false,
        response: NextResponse.json(
          {
            success: false,
            mustChangePassword: true,
            message: "Temporary password in use. You must change your password before accessing administrative features.",
          },
          { status: 403 }
        ),
      };
    }

    let roleSlug = (dbUser.role as string || "editor").toLowerCase();
    if (dbUser.role === "ADMIN") roleSlug = "chief_editor";
    if (dbUser.role === "SUPERADMIN") roleSlug = "super_admin";

    return {
      ok: true,
      payload: {
        ...payload,
        userId: dbUser.id,
        name: dbUser.name || payload.name,
        email: dbUser.email,
        role: roleSlug,
      },
    };
  } catch (dbError) {
    console.error("[apiAuth] Database failure during authentication verification:", dbError);
    // FAIL-CLOSED: Never allow access if database status cannot be confirmed
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Authentication service temporarily unavailable. Database connection error." },
        { status: 503 }
      ),
    };
  }
}

/**
 * Require at least chief_editor role.
 * Editors can read, but only chief_editor+ can write.
 */
export async function requireChiefOrAbove(
  req: NextRequest
): Promise<AuthResult> {
  const auth = await requireAdminAuth(req);
  if (!auth.ok) return auth;

  const { role } = auth.payload;
  if (role === "editor") {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Insufficient permissions. Chief Editor or Super Admin required." },
        { status: 403 }
      ),
    };
  }

  return auth;
}

/**
 * Require super_admin role exclusively.
 */
export async function requireSuperAdmin(
  req: NextRequest
): Promise<AuthResult> {
  const auth = await requireAdminAuth(req);
  if (!auth.ok) return auth;

  const { role } = auth.payload;
  if (role !== "super_admin") {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Super Admin privileges required." },
        { status: 403 }
      ),
    };
  }

  return auth;
}
