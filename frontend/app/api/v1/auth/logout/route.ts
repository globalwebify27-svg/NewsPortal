// =============================================================================
// POST /api/v1/auth/logout — Server-Side Admin Logout
// Revokes the database session and clears the httpOnly session cookie.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, COOKIE_OPTIONS, revokeDatabaseSession } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (token) {
    await revokeDatabaseSession(token);
    await logAuditEvent({
      action: "LOGOUT",
      resource: "AUTH",
    });
  }

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  // Expire the cookie immediately
  response.cookies.set(ADMIN_COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
