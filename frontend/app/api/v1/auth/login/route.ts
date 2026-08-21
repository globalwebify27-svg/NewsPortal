// =====================================================================
// POST /api/v1/auth/login
// Secure server-side authentication — super admin credentials NEVER
// exposed to browser. All comparisons happen here on the server.
// =====================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Super admin credentials read from environment — never in client bundle
const SUPER_ADMIN_EMAIL   = process.env.SUPER_ADMIN_EMAIL   || "global2409";
const SUPER_ADMIN_EMAIL2  = process.env.SUPER_ADMIN_EMAIL2  || "global2409@globalawaaz.com";
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "Global@#2409";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email    = (body.email    || "").trim().toLowerCase();
    const password = (body.password || "").trim();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    // ── 1. Super Admin Check (server-side only) ──────────────────────
    const isSuperAdmin =
      (email === SUPER_ADMIN_EMAIL.toLowerCase() || email === SUPER_ADMIN_EMAIL2.toLowerCase()) &&
      password === SUPER_ADMIN_PASSWORD;

    if (isSuperAdmin) {
      return NextResponse.json({
        success: true,
        user: { name: "Global Awaaz Admin", role: "super_admin" },
      });
    }

    // ── 2. Staff DB Check ────────────────────────────────────────────
    const staff = await prisma.user.findMany({
      select: { id: true, name: true, email: true, password: true, role: true },
    });

    const matched = staff.find(
      (u) =>
        (u.email?.toLowerCase() === email || u.name?.toLowerCase() === email) &&
        u.password === password
    );

    if (matched) {
      let roleSlug = (matched.role as string || "EDITOR").toLowerCase();
      if (matched.role === "ADMIN") roleSlug = "chief_editor";
      if (matched.role === "SUPERADMIN") roleSlug = "super_admin";

      return NextResponse.json({
        success: true,
        user: {
          name: matched.name || matched.email,
          role: roleSlug,
        },
      });
    }

    // ── 3. Auth failure ──────────────────────────────────────────────
    return NextResponse.json(
      { success: false, message: "Authentication failed. Invalid Admin ID or Password." },
      { status: 401 }
    );
  } catch (err: any) {
    console.error("[auth/login] error:", err);
    return NextResponse.json(
      { success: false, message: "Server error during authentication." },
      { status: 500 }
    );
  }
}
