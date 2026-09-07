// =============================================================================
// API Auth Guard — requireAdminAuth()
// Call at the top of any API route that requires admin authentication.
// Reads the httpOnly ga_admin_token cookie and verifies the JWT.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE_NAME, type AdminTokenPayload } from "./auth";

export type AuthSuccess = { ok: true; payload: AdminTokenPayload; response?: never };
export type AuthFailure = { ok: false; response: NextResponse; payload?: never };
export type AuthResult = AuthSuccess | AuthFailure;

/**
 * Verify the admin session cookie on any incoming API request.
 *
 * Usage:
 *   const auth = await requireAdminAuth(request);
 *   if (!auth.ok) return auth.response;
 *   const { role } = auth.payload; // "super_admin" | "chief_editor" | "editor"
 */
export async function requireAdminAuth(
  req: NextRequest
): Promise<AuthSuccess | AuthFailure> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Authentication required. Please log in to the admin panel." },
        { status: 401 }
      ),
    };
  }

  const payload = await verifyAdminToken(token);

  if (!payload) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: "Session expired or invalid. Please log in again." },
        { status: 401 }
      ),
    };
  }

  return { ok: true, payload };
}

/**
 * Require at least chief_editor role.
 * Editors can read, but only chief_editor+ can write.
 */
export async function requireChiefOrAbove(
  req: NextRequest
): Promise<AuthSuccess | AuthFailure> {
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
