// =============================================================================
// POST /api/v1/auth/login — Production Database-Backed Admin Authentication
// - MySQL is the single source of truth for all users and credentials
// - IP-based rate limiting to prevent brute-force attacks and DoS
// - Atomic failed attempt counter & brute-force lockout protection
// - Session ID binding inside JWT & database session registration
// - Issues httpOnly Secure JWT cookie on success
// - DELETE /api/v1/auth/login — Session revocation & secure logout
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  comparePassword,
  hashPassword,
  isBcryptHash,
  signAdminToken,
  createDatabaseSession,
  revokeDatabaseSession,
  ADMIN_COOKIE_NAME,
  COOKIE_OPTIONS,
} from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_IP_ATTEMPTS = 15;

// In-memory sliding window store for IP rate limiting
const ipAttempts = new Map<string, { count: number; resetAt: number }>();

function checkIpRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    ipAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_IP_ATTEMPTS) {
    return false;
  }

  entry.count += 1;
  return true;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

export async function POST(req: NextRequest) {
  const ipAddress = getClientIp(req);
  const userAgent = req.headers.get("user-agent") || undefined;

  // ── 0. IP Rate Limiting Check ──────────────────────────────────────────
  if (!checkIpRateLimit(ipAddress)) {
    await logAuditEvent({
      action: "LOGIN_FAILED",
      resource: "AUTH",
      before: { reason: "IP_RATE_LIMITED", ipAddress },
      ipAddress,
      userAgent,
    });
    return NextResponse.json(
      { success: false, message: "Too many login attempts from this network. Please wait 5 minutes." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const loginIdentifier = (body.email || "").trim().toLowerCase();
    const password = (body.password || "").trim();

    if (!loginIdentifier || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    // ── 1. Look up user in MySQL by email or name/username ─────────────────
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: loginIdentifier } },
          { name: { equals: loginIdentifier } },
        ],
      },
    });

    // ── Fallback bootstrap: if database has no superadmin, check env vars ──
    if (!user) {
      const superEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
      const superEmail2 = process.env.SUPER_ADMIN_EMAIL2?.trim().toLowerCase();
      const isSuperEmail =
        (superEmail && loginIdentifier === superEmail) ||
        (superEmail2 && loginIdentifier === superEmail2) ||
        loginIdentifier === "global2409";

      if (isSuperEmail && process.env.SUPER_ADMIN_PASSWORD) {
        const initialHash = await hashPassword(process.env.SUPER_ADMIN_PASSWORD);
        user = await prisma.user.create({
          data: {
            name: "Global Awaaz Admin",
            email: process.env.SUPER_ADMIN_EMAIL || "global2409@globalawaaz.com",
            password: initialHash,
            role: "SUPERADMIN",
            isActive: true,
          },
        });
      }
    }

    if (!user || !user.password) {
      await logAuditEvent({
        action: "LOGIN_FAILED",
        resource: "AUTH",
        before: { identifier: loginIdentifier },
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        { success: false, message: "Authentication failed. Invalid Admin ID or Password." },
        { status: 401 }
      );
    }

    // ── 2. Account Status Check (Active / Suspended) ────────────────────────
    if (user.isActive === false) {
      await logAuditEvent({
        userId: user.id,
        action: "LOGIN_FAILED",
        resource: "AUTH",
        before: { reason: "ACCOUNT_DEACTIVATED", email: user.email },
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Authentication failed. Account is deactivated. Contact an administrator.",
        },
        { status: 403 }
      );
    }

    // ── 3. Brute-Force Lockout Check ───────────────────────────────────────
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesRemaining = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / (60 * 1000)
      );

      await logAuditEvent({
        userId: user.id,
        action: "LOGIN_LOCKED",
        resource: "AUTH",
        before: { lockedUntil: user.lockedUntil, minutesRemaining },
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        {
          success: false,
          message: `Account is temporarily locked. Please try again in ${minutesRemaining} minute(s).`,
        },
        { status: 429 }
      );
    }

    // ── 4. Secure Password Verification ────────────────────────────────────
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      const currentAttempts = (user.failedLoginAttempts || 0) + 1;
      let newLockedUntil: Date | null = null;

      if (currentAttempts >= MAX_FAILED_ATTEMPTS) {
        newLockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: { increment: 1 },
          lockedUntil: newLockedUntil,
        },
      });

      await logAuditEvent({
        userId: user.id,
        action: "LOGIN_FAILED",
        resource: "AUTH",
        before: { attempts: currentAttempts, locked: Boolean(newLockedUntil) },
        ipAddress,
        userAgent,
      });

      const message = newLockedUntil
        ? `Account locked for ${LOCKOUT_MINUTES} minutes due to excessive failed attempts.`
        : "Authentication failed. Invalid Admin ID or Password.";

      return NextResponse.json({ success: false, message }, { status: 401 });
    }

    // ── 5. Successful Authentication: Reset counters & Upgrade hash ────────
    const updates: Record<string, unknown> = {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    };

    if (!isBcryptHash(user.password)) {
      updates.password = await hashPassword(password);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updates,
    });

    // ── 6. Normalize Role Slug ─────────────────────────────────────────────
    let roleSlug = (user.role as string || "editor").toLowerCase();
    if (user.role === "ADMIN") roleSlug = "chief_editor";
    if (user.role === "SUPERADMIN") roleSlug = "super_admin";

    const displayName = user.name || user.email || "Admin";

    // ── 7. Create Database Session & Bind ID to JWT ────────────────────────
    let sessionId: string | undefined = undefined;
    try {
      const dbSession = await createDatabaseSession({
        userId: user.id,
        ipAddress,
        userAgent,
      });
      sessionId = dbSession.id;
    } catch (sessionErr) {
      console.error("[AUTH] Warning: Failed to record DB session:", sessionErr);
    }

    const token = await signAdminToken({
      userId: user.id,
      name: displayName,
      email: user.email,
      role: roleSlug,
      sessionId,
    });

    // Store signed token in the session record for lookup if session created
    if (sessionId) {
      try {
        await prisma.session.update({
          where: { id: sessionId },
          data: { token },
        });
      } catch (tokenUpdateErr) {
        console.error("[AUTH] Warning: Failed to update session token:", tokenUpdateErr);
      }
    }

    // ── 8. Audit Log Success ───────────────────────────────────────────────
    try {
      await logAuditEvent({
        userId: user.id,
        action: "LOGIN_SUCCESS",
        resource: "AUTH",
        after: { email: user.email, role: roleSlug, sessionId },
        ipAddress,
        userAgent,
      });
    } catch (auditErr) {
      console.error("[AUTH] Warning: Failed to record audit log:", auditErr);
    }

    // ── 9. Return Response with HttpOnly Cookie (No sensitive data exposed) ──
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: displayName,
        email: user.email,
        role: roleSlug,
        mustChangePassword: user.mustChangePassword,
      },
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, COOKIE_OPTIONS);
    return response;
  } catch (err) {
    console.error("[auth/login] error:", err);
    return NextResponse.json(
      { success: false, message: "Server error during authentication." },
      { status: 500 }
    );
  }
}

/** DELETE /api/v1/auth/login — Server-side logout: revokes session & clears cookie */
export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const ipAddress = getClientIp(req);

  if (token) {
    await revokeDatabaseSession(token);
    await logAuditEvent({
      action: "LOGOUT",
      resource: "AUTH",
      ipAddress,
    });
  }

  const response = NextResponse.json({ success: true, message: "Logged out successfully." });
  response.cookies.set(ADMIN_COOKIE_NAME, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}

/** GET /api/v1/auth/login — Verify active cookie session */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ success: false, message: "No session cookie" }, { status: 401 });
  }

  try {
    const { verifyAdminToken } = await import("@/lib/auth");
    const payload = await verifyAdminToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: payload.userId,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch {
    return NextResponse.json({ success: false, message: "Session expired" }, { status: 401 });
  }
}
