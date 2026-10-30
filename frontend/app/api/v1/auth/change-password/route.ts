// =============================================================================
// POST /api/v1/auth/change-password — Secure Password Change API
// - Verifies current password
// - Validates new password complexity and difference
// - Hashes new password with 12-round bcrypt
// - Resets mustChangePassword flag to false
// - Invalidates ALL previous sessions
// - Issues a fresh session & JWT cookie
// - Records PASSWORD_CHANGE audit log
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/apiAuth";
import {
  comparePassword,
  hashPassword,
  signAdminToken,
  createDatabaseSession,
  revokeAllUserSessions,
  ADMIN_COOKIE_NAME,
  COOKIE_OPTIONS,
} from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.ok) return auth.response;

  const ipAddress = getClientIp(req);
  const userAgent = req.headers.get("user-agent") || undefined;
  const userId = auth.payload.userId;

  try {
    const body = await req.json();
    const currentPassword = (body.currentPassword || "").trim();
    const newPassword = (body.newPassword || "").trim();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Current password and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, message: "New password cannot be identical to the current temporary password." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, message: "User account not found." },
        { status: 404 }
      );
    }

    // Verify current password
    const match = await comparePassword(currentPassword, user.password);
    if (!match) {
      return NextResponse.json(
        { success: false, message: "Current password verification failed." },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user record
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Invalidate ALL previous active sessions across all devices
    await revokeAllUserSessions(userId);

    // Create fresh database session for current device
    const newSession = await createDatabaseSession({
      userId,
      ipAddress,
      userAgent,
    });

    // Sign new JWT bound to the fresh session
    const newToken = await signAdminToken({
      userId,
      name: user.name || auth.payload.name,
      email: user.email,
      role: auth.payload.role,
      sessionId: newSession.id,
    });

    // Update session record with the new token
    await prisma.session.update({
      where: { id: newSession.id },
      data: { token: newToken },
    });

    // Record audit event
    await logAuditEvent({
      userId,
      action: "PASSWORD_CHANGE",
      resource: "USER",
      resourceId: userId,
      ipAddress,
      userAgent,
    });

    const response = NextResponse.json({
      success: true,
      message: "Password changed successfully. All previous sessions have been invalidated.",
    });

    response.cookies.set(ADMIN_COOKIE_NAME, newToken, COOKIE_OPTIONS);
    return response;
  } catch (error: any) {
    console.error("[change-password] Error updating password:", error);
    return NextResponse.json(
      { success: false, message: "Server error updating password." },
      { status: 500 }
    );
  }
}

