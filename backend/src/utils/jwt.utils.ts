// =============================================================================
// JWT Utilities — Access & Refresh Token Generation/Verification
// =============================================================================

import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

export interface JWTPayload {
  id: string;
  email: string;
  role: Role;
  type: "access" | "refresh";
}

// ─── Generate Access Token (short-lived) ─────────────────────────────────────
export function generateAccessToken(payload: Omit<JWTPayload, "type">): string {
  const secret: jwt.Secret = process.env.JWT_ACCESS_SECRET || "access-secret";
  const expiresIn = (process.env.JWT_ACCESS_EXPIRES || "15m") as jwt.SignOptions["expiresIn"];
  return jwt.sign({ ...payload, type: "access" }, secret, { expiresIn });
}

// ─── Generate Refresh Token (long-lived) ─────────────────────────────────────
export function generateRefreshToken(payload: Omit<JWTPayload, "type">): string {
  const secret: jwt.Secret = process.env.JWT_REFRESH_SECRET || "refresh-secret";
  const expiresIn = (process.env.JWT_REFRESH_EXPIRES || "30d") as jwt.SignOptions["expiresIn"];
  return jwt.sign({ ...payload, type: "refresh" }, secret, { expiresIn });
}

// ─── Verify Token ─────────────────────────────────────────────────────────────
export function verifyToken(token: string, expectedType: "access" | "refresh"): JWTPayload {
  const secret =
    expectedType === "access"
      ? (process.env.JWT_ACCESS_SECRET as string)
      : (process.env.JWT_REFRESH_SECRET as string);

  const decoded = jwt.verify(token, secret) as JWTPayload;

  if (decoded.type !== expectedType) {
    throw new jwt.JsonWebTokenError(`Invalid token type: expected ${expectedType}`);
  }

  return decoded;
}

// ─── Generate Both Tokens ─────────────────────────────────────────────────────
export function generateTokenPair(user: { id: string; email: string; role: Role }) {
  const payload = { id: user.id, email: user.email, role: user.role };
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

// ─── Cookie Options ───────────────────────────────────────────────────────────
export const accessTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: "/api/v1/auth/refresh-token",
};
