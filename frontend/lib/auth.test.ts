import { describe, it, expect, beforeAll } from "vitest";
import { signAdminToken, verifyAdminToken, hashPassword, comparePassword, generateSecurePassword, isBcryptHash } from "./auth";

describe("Authentication Utilities (lib/auth.ts)", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "test_super_secret_jwt_key_that_is_long_enough_for_security_123456789";
  });
  it("should hash and verify passwords with bcrypt", async () => {
    const plain = "SuperSecretPassword123!";
    const hash = await hashPassword(plain);

    expect(hash).not.toBe(plain);
    expect(hash.startsWith("$2")).toBe(true);

    const match = await comparePassword(plain, hash);
    expect(match).toBe(true);

    const wrongMatch = await comparePassword("WrongPassword", hash);
    expect(wrongMatch).toBe(false);
  });

  it("should fallback safely to plaintext comparison for unmigrated legacy passwords", async () => {
    const legacyPlain = "LegacyAdminPassword2026";
    const match = await comparePassword(legacyPlain, legacyPlain);
    expect(match).toBe(true);

    const mismatch = await comparePassword("Wrong", legacyPlain);
    expect(mismatch).toBe(false);
  });

  it("should sign and verify valid JWT admin tokens", async () => {
    const payload = {
      userId: "user_123",
      email: "admin@globalawaaz.com",
      role: "super_admin" as const,
      name: "Global Admin",
    };

    const token = await signAdminToken(payload);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);

    const verified = await verifyAdminToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.email).toBe(payload.email);
    expect(verified?.role).toBe("super_admin");
  });

  it("should reject tampered or invalid JWT tokens", async () => {
    const verified = await verifyAdminToken("invalid.tampered.token");
    expect(verified).toBeNull();
  });

  it("should generate cryptographically secure temporary passwords", () => {
    const pwd1 = generateSecurePassword(16);
    const pwd2 = generateSecurePassword(16);

    expect(pwd1.length).toBe(16);
    expect(pwd2.length).toBe(16);
    expect(pwd1).not.toBe(pwd2);

    // Checks for character diversity
    expect(/[A-Z]/.test(pwd1)).toBe(true);
    expect(/[a-z]/.test(pwd1)).toBe(true);
    expect(/[0-9]/.test(pwd1)).toBe(true);
  });

  it("should properly identify bcrypt hashes vs plaintext", () => {
    expect(isBcryptHash("$2b$12$e80yqf0/iG7H")).toBe(true);
    expect(isBcryptHash("$2a$12$e80yqf0/iG7H")).toBe(true);
    expect(isBcryptHash("PlaintextPassword123")).toBe(false);
  });
});
