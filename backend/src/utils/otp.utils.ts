// =============================================================================
// OTP Utility — Generate & Verify Time-Based OTPs stored in Redis
// =============================================================================

import crypto from "crypto";
import { redis } from "../config/redis";

const OTP_EXPIRY = Number(process.env.OTP_EXPIRY_MINUTES || 10) * 60;

// ─── Generate 6-Digit Numeric OTP ────────────────────────────────────────────
export function generateOTP(length: number = 6): string {
  return crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
}

// ─── Store OTP in Redis ───────────────────────────────────────────────────────
export async function storeOTP(key: string, otp: string): Promise<void> {
  await redis.setex(`otp:${key}`, OTP_EXPIRY, otp);
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────
export async function verifyOTP(key: string, otp: string): Promise<boolean> {
  const stored = await redis.get(`otp:${key}`);
  if (!stored || stored !== otp) return false;
  await redis.del(`otp:${key}`); // Single use — delete after verification
  return true;
}

// ─── Invalidate OTP (e.g. after too many attempts) ────────────────────────────
export async function invalidateOTP(key: string): Promise<void> {
  await redis.del(`otp:${key}`);
}
