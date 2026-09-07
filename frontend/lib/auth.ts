// =============================================================================
// Auth Utilities — JWT signing/verification + bcrypt password hashing
// Works in both Node.js API routes (jose) and Edge Runtime (middleware)
// =============================================================================

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";

// ---------------------------------------------------------------------------
// JWT Configuration
// ---------------------------------------------------------------------------

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || "ga_default_jwt_secret_newsportal_globalawaaz_2026_fallback";
  return new TextEncoder().encode(secret);
}

export interface AdminTokenPayload extends JWTPayload {
  name: string;
  role: string;
}

/** Sign a 24-hour admin session JWT. */
export async function signAdminToken(
  payload: Pick<AdminTokenPayload, "name" | "role">
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

/** Cookie options — Secure + httpOnly + SameSite=Strict */
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 60 * 60 * 24, // 24 hours in seconds
};

// ---------------------------------------------------------------------------
// Password hashing (bcryptjs — works in Node.js runtime only)
// ---------------------------------------------------------------------------

const BCRYPT_ROUNDS = 12;

/** Hash a plaintext password. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/**
 * Compare a plaintext password against a stored value.
 * Handles both bcrypt hashes AND legacy plaintext passwords for backwards
 * compatibility during migration. Returns true if match.
 */
export async function comparePassword(
  plain: string,
  stored: string
): Promise<boolean> {
  // If stored value looks like a bcrypt hash — use bcrypt compare
  if (stored.startsWith("$2b$") || stored.startsWith("$2a$")) {
    return bcrypt.compare(plain, stored);
  }
  // Legacy plaintext fallback — direct compare (will be re-hashed on next update)
  return plain === stored;
}

/** Check if a stored password value is already a bcrypt hash. */
export function isBcryptHash(value: string): boolean {
  return value.startsWith("$2b$") || value.startsWith("$2a$");
}
