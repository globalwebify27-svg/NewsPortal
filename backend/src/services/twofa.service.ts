// =============================================================================
// 2FA Security Service — TOTP Secret Generation & Verification
// =============================================================================

import speakeasy from "speakeasy";
import QRCode from "qrcode";
import crypto from "crypto";

export interface Generate2FAResponse {
  secret: string;
  qrCodeUrl: string;
  otpauthUrl: string;
  backupCodes: string[];
}

export async function generate2FASecret(email: string): Promise<Generate2FAResponse> {
  const secret = speakeasy.generateSecret({
    length: 20,
    name: `Global Awaaz Admin (${email})`,
    issuer: "Global Awaaz CMS",
  });

  const otpauthUrl = secret.otpauth_url || "";
  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

  // Generate 8 backup codes
  const backupCodes: string[] = [];
  for (let i = 0; i < 8; i++) {
    backupCodes.push(crypto.randomBytes(4).toString("hex").toUpperCase());
  }

  return {
    secret: secret.base32,
    qrCodeUrl,
    otpauthUrl,
    backupCodes,
  };
}

export function verify2FAToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1, // allow 30s window tolerance
  });
}
