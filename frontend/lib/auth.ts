// =============================================================================
// Auth Utilities — JWT signing/verification + bcrypt password hashing + Sessions
// Works in both Node.js API routes (jose) and Edge Runtime (middleware)
// =============================================================================

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "./prisma";

// ---------------------------------------------------------------------------
// JWT Configuration
// ---------------------------------------------------------------------------

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: JWT_SECRET environment variable is missing in production environment.");
    }
    // Local development fallback only
    return new TextEncoder().encode("ga_local_dev_only_jwt_secret_not_for_production_use_2026");
  }
  return new TextEncoder().encode(secret);
}

export interface AdminTokenPayload extends JWTPayload {
  userId?: string;
  name: string;
  email?: string;
  role: string;
  sessionId?: string;
}

/** Sign a 24-hour admin session JWT with session ID binding. */
export async function signAdminToken(
  payload: Pick<AdminTokenPayload, "userId" | "name" | "email" | "role" | "sessionId">
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJwtSecret());
}

/** Verify a JWT and return its payload, or null if invalid/expired. */
export async function verifyAdminToken(
  token: string
): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as AdminTokenPayload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

/** Name of the httpOnly admin session cookie. */
export const ADMIN_COOKIE_NAME = "ga_admin_token";

/** Cookie options — Secure + httpOnly + SameSite=Lax (safe across navigation) */
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24, // 24 hours in seconds
};

// ---------------------------------------------------------------------------
// Password hashing (bcryptjs) & Generator
// ---------------------------------------------------------------------------

const BCRYPT_ROUNDS = 12;

/** Hash a plaintext password securely using bcrypt. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/**
 * Compare a plaintext password against a stored hash.
 * Handles bcrypt hashes with fallback for backwards compatibility during migration.
 */
export async function comparePassword(
  plain: string,
  stored: string
): Promise<boolean> {
  if (stored.startsWith("$2b$") || stored.startsWith("$2a$") || stored.startsWith("$2y$")) {
    return bcrypt.compare(plain, stored);
  }
  // Constant-time string equality fallback for legacy migration records
  try {
    const bufA = Buffer.from(plain);
    const bufB = Buffer.from(stored);
    if (bufA.length === bufB.length) {
      return crypto.timingSafeEqual(bufA, bufB);
    }
  } catch (_) {}
  return plain === stored;
}

/** Check if a stored password value is already a bcrypt hash. */
export function isBcryptHash(value: string): boolean {
  return value.startsWith("$2b$") || value.startsWith("$2a$") || value.startsWith("$2y$");
}

/**
 * Generate a cryptographically secure random temporary password.
 * Contains uppercase, lowercase, numbers, and special symbols.
 */
export function generateSecurePassword(length = 16): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude easily confused chars (I, O)
  const lower = "abcdefghjkmnpqrstuvwxyz"; // exclude easily confused chars (l, o)
  const numbers = "23456789";              // exclude 0, 1
  const symbols = "!@#$%^&*()-_=+";
  const allChars = upper + lower + numbers + symbols;

  let pwd = "";
  // Ensure at least one of each required class
  pwd += upper[crypto.randomInt(0, upper.length)];
  pwd += lower[crypto.randomInt(0, lower.length)];
  pwd += numbers[crypto.randomInt(0, numbers.length)];
  pwd += symbols[crypto.randomInt(0, symbols.length)];

  for (let i = 4; i < length; i++) {
    pwd += allChars[crypto.randomInt(0, allChars.length)];
  }

  // Shuffle the result using Fisher-Yates
  const arr = pwd.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

// ---------------------------------------------------------------------------
// Database Session Management
// ---------------------------------------------------------------------------

/** Create a session in the MySQL sessions table. */
export async function createDatabaseSession(params: {
  userId: string;
  token?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresInSeconds?: number;
}) {
  const expiresAt = new Date(Date.now() + (params.expiresInSeconds || 86400) * 1000);
  const tokenValue = params.token || crypto.randomBytes(32).toString("hex");

  return prisma.session.create({
    data: {
      userId: params.userId,
      token: tokenValue,
      expiresAt,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
      isRevoked: false,
    },
  });
}

/** Invalidate/Revoke a specific session in the database. */
export async function revokeDatabaseSession(tokenOrSessionId: string) {
  try {
    await prisma.session.updateMany({
      where: {
        OR: [
          { token: tokenOrSessionId },
          { id: tokenOrSessionId },
        ],
      },
      data: { isRevoked: true },
    });
  } catch (error) {
    console.error("[auth] Failed to revoke session in DB:", error);
  }
}

/** Invalidate ALL active sessions for a user (on password change or suspension). */
export async function revokeAllUserSessions(userId: string) {
  try {
    await prisma.session.updateMany({
      where: {
        userId,
        isRevoked: false,
      },
      data: { isRevoked: true },
    });
  } catch (error) {
    console.error("[auth] Failed to revoke user sessions:", error);
  }
}
