// =============================================================================
// POST /api/v1/auth/logout — Server-Side Admin Logout
// Clears the httpOnly session cookie. Call this from the logout button.
// =============================================================================

import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });
  // Expire the cookie immediately
  response.cookies.set(ADMIN_COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
