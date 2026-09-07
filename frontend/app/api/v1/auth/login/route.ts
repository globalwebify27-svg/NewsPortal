// =============================================================================
// POST /api/v1/auth/login — Secure Admin Authentication
// - bcrypt password comparison (with legacy plaintext fallback)
// - Issues httpOnly Secure JWT cookie on success
// - Never exposes credentials to browser JS
// DELETE /api/v1/auth/login — Logout (clears the httpOnly cookie)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  comparePassword,
  signAdminToken,
  ADMIN_COOKIE_NAME,
  COOKIE_OPTIONS,
} from "@/lib/auth";

// Read from environment — NO hardcoded fallbacks
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
const SUPER_ADMIN_EMAIL2 = process.env.SUPER_ADMIN_EMAIL2;
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = (body.password || "").trim();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    // ── 1. Validate env vars exist (fail loudly if misconfigured) ──────────
    if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
      console.error("[auth/login] SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD env vars are not set.");
      return NextResponse.json(
        { success: false, message: "Server authentication is not configured." },
        { status: 503 }
      );
    }

    // ── 2. Super Admin Check ────────────────────────────────────────────────
    const isSuperAdminEmail =
      email === SUPER_ADMIN_EMAIL.toLowerCase() ||
      (SUPER_ADMIN_EMAIL2 && email === SUPER_ADMIN_EMAIL2.toLowerCase());

    if (isSuperAdminEmail) {
      const passwordMatch = await comparePassword(password, SUPER_ADMIN_PASSWORD);
      if (!passwordMatch) {
        return NextResponse.json(
          { success: false, message: "Authentication failed. Invalid credentials." },
          { status: 401 }
        );
      }

      const token = await signAdminToken({ name: "Global Awaaz Admin", role: "super_admin" });
      const response = NextResponse.json({
        success: true,
        user: { name: "Global Awaaz Admin", role: "super_admin" },
      });
      response.cookies.set(ADMIN_COOKIE_NAME, token, COOKIE_OPTIONS);
      return response;
    }

    // ── 3. Staff DB Check ────────────────────────────────────────────────────
    const staff = await prisma.user.findMany({
      select: { id: true, name: true, email: true, password: true, role: true },
    });

    const matched = staff.find(
      (u) =>
        (u.email?.toLowerCase() === email || u.name?.toLowerCase() === email) &&
        u.password != null
    );

    if (matched && matched.password) {
      const passwordMatch = await comparePassword(password, matched.password);
      if (!passwordMatch) {
        return NextResponse.json(
          { success: false, message: "Authentication failed. Invalid credentials." },
          { status: 401 }
        );
      }

      let roleSlug = (matched.role as string || "editor").toLowerCase();
      if (matched.role === "ADMIN") roleSlug = "chief_editor";
      if (matched.role === "SUPERADMIN") roleSlug = "super_admin";

      const displayName = matched.name || matched.email || "Admin";
      const token = await signAdminToken({ name: displayName, role: roleSlug });

      const response = NextResponse.json({
        success: true,
        user: { name: displayName, role: roleSlug },
      });
      response.cookies.set(ADMIN_COOKIE_NAME, token, COOKIE_OPTIONS);
      return response;
    }

    // ── 4. Auth failure ──────────────────────────────────────────────────────
    return NextResponse.json(
      { success: false, message: "Authentication failed. Invalid Admin ID or Password." },
      { status: 401 }
    );
  } catch (err) {
    console.error("[auth/login] error:", err);
    return NextResponse.json(
      { success: false, message: "Server error during authentication." },
      { status: 500 }
    );
  }
}

/** DELETE /api/v1/auth/login — Server-side logout: clears the httpOnly cookie */
export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully." });
  response.cookies.set(ADMIN_COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
